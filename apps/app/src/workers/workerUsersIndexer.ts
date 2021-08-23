import * as CAF from 'caf'
import { createLogger } from '../shared/logger'
import { ControlRef } from '../contexts/skynet/ref'
import uniq from 'lodash/uniq'
import {
  EntryFeed,
  IUser,
  RelationshipType,
  UsersMap,
  WorkerParams,
} from '@riftdweb/types'
import { clearToken, handleToken } from './tokens'
import { wait, waitFor } from '../shared/wait'
import { syncUser } from './user'

const FALSE_START_WAIT_INTERVAL = 1000 * 2

const BATCH_SIZE = 5

const log = createLogger('userIndexer')
const cafUserIndexer = CAF(function* userIndexer(
  signal: any,
  ref: ControlRef,
  params: WorkerParams
): Generator<Promise<EntryFeed | string[] | void | UsersMap>, any, any> {
  let tasks = []
  try {
    log('Running')

    while (true) {
      const userIds = ref.current.getUsersPendingUpdate()
      if (!userIds.length) {
        log('No pending users, sleeping')
        yield wait(5_000)
        continue
      }
      log(`Users pending updates: ${userIds.length}`)

      const batch = userIds.splice(0, BATCH_SIZE)
      log('Batch', batch)

      tasks = batch.map((userId) =>
        syncUser(ref, userId, 'index', {
          workflowId: params.workflowId,
        })
      )

      yield Promise.all(tasks)
      log('Batch complete')

      // Index the discovered following
      const updatedUsers = batch.map(ref.current.getUser)
      log(updatedUsers)
      const userIdsToAdd = []
      updatedUsers.forEach((newItem) => {
        if (newItem) {
          userIdsToAdd.push(...newItem.following.data)
        }
      })

      ref.current.addNewUserIds(userIdsToAdd)

      // Recompute followers
      yield recomputeFollowers(ref)
    }
  } finally {
    log('Exiting, finally')
    if (signal.aborted) {
      log('Aborted')
    }
  }
})

export async function recomputeFollowers(ref: ControlRef): Promise<void> {
  log('Recomputing followers')
  const updatedAt = new Date().getTime()

  // Start with map of all users
  const updatedUsersMap = ref.current.usersMap.data.entries

  ref.current.discoveredUsersIndex.forEach((user) => {
    // Update users followers
    for (let followingId of user.following.data) {
      let followingUser = updatedUsersMap[followingId]
      if (followingUser) {
        followingUser = {
          ...followingUser,
          followers: {
            updatedAt,
            data: uniq([...followingUser.followers.data, user.userId]),
          },
        }
        updatedUsersMap[followingId] = followingUser
      }
    }
  })

  // Update relationship for all users
  const updatedUsers = Object.entries(updatedUsersMap).map(
    ([userId, user]) => ({
      ...user,
      relationship: {
        updatedAt,
        data: getRelationship(ref, user),
      },
    })
  )

  await ref.current.upsertUsers(updatedUsers)
}

function getRelationship(ref: ControlRef, user: IUser): RelationshipType {
  const followsMe = user.following.data.includes(ref.current.myUserId)
  const iFollow = user.followers.data.includes(ref.current.myUserId)

  let relationship: RelationshipType = 'none'

  if (followsMe && iFollow) {
    relationship = 'friend'
  } else if (followsMe) {
    relationship = 'follower'
  } else if (iFollow) {
    relationship = 'following'
  }

  return relationship
}

export async function workerUserIndexer(
  ref: ControlRef,
  params: WorkerParams = {}
): Promise<any> {
  const token = await handleToken(ref, 'userIndexer')
  try {
    await cafUserIndexer(token.signal, ref, params)
  } catch (e) {
    log(e)
  } finally {
    clearToken(ref, 'userIndexer')
  }
}

const logScheduler = createLogger('userIndexer/schedule')

async function maybeRunUserIndexer(ref: ControlRef): Promise<any> {
  await waitFor(() => [ref.current.isInitUsersComplete], {
    log: logScheduler,
    resourceName: 'init users',
    intervalTime: FALSE_START_WAIT_INTERVAL,
  })

  // If indexer is already running skip
  if (ref.current.tokens.userIndexer) {
    logScheduler(`Indexer already running, skipping`)
  } else {
    logScheduler(`Indexer starting`)
    workerUserIndexer(ref)
  }
}

export async function scheduleUserIndexer(ref: ControlRef): Promise<any> {
  log('Starting scheduler')

  // Give the page render requests a few seconds to complete
  await wait(3000)

  maybeRunUserIndexer(ref)
}
