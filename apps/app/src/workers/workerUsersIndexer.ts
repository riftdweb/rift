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
import { fetchUserForIndexing } from './workerUpdateUser'
import { TaskQueue } from '../shared/taskQueue'

const SCHEDULE_INTERVAL_INDEXER = 1000 * 60 * 5
const FALSE_START_WAIT_INTERVAL = 1000 * 2

const BATCH_SIZE = 5

const taskQueue = TaskQueue('userIndexer', {
  poolSize: 5,
})

const log = createLogger('userIndexer')
const cafUserIndexer = CAF(function* userIndexer(
  signal: any,
  ref: ControlRef,
  params: WorkerParams
): Generator<Promise<EntryFeed | string[] | void | UsersMap>, any, any> {
  let tasks = []
  try {
    log('Running')

    while (ref.current.pendingUserIds.length) {
      log(`Processing: ${ref.current.pendingUserIds.length}`)
      const batch = ref.current.pendingUserIds.splice(0, BATCH_SIZE)
      log('Batch', batch)

      tasks = batch.map((userId) => {
        const task = async () => fetchUserForIndexing(ref, userId)
        return taskQueue.add(task, {
          name: `user/fetch: ${userId} - indexer batch`,
        })
      })
      const updatedUsers: IUser[] = yield Promise.all(tasks)

      const userIdsToAdd = []
      // Index the discovered following
      updatedUsers.forEach((newItem) => {
        userIdsToAdd.push(...newItem.following.data)
      })

      ref.current.addNewUserIds(userIdsToAdd)
      recomputeFollowers(ref)
    }
    log('Done')
    return
  } finally {
    log('Finally')
    if (signal.aborted) {
      log('Aborted')
    }
  }
})

export function recomputeFollowers(ref: ControlRef) {
  log('Recomputing followers')
  const updatedUsers: Record<string, IUser> = {}
  const updatedAt = new Date().getTime()

  ref.current.usersIndex.forEach((user) => {
    // Update users followers
    for (let followingId of user.following.data) {
      let followingUser =
        updatedUsers[followingId] || ref.current.getUser(followingId)
      if (followingUser) {
        followingUser = {
          ...followingUser,
          followers: {
            updatedAt,
            data: uniq([...followingUser.followers.data, user.userId]),
          },
        }
        updatedUsers[followingId] = followingUser
      }
    }

    // Update relationship
    let updatedUser =
      updatedUsers[user.userId] || ref.current.getUser(user.userId)

    updatedUsers[user.userId] = {
      ...updatedUser,
      relationship: {
        updatedAt,
        data: getRelationship(ref, updatedUser),
      },
    }
  })
  ref.current.upsertUsers(Object.entries(updatedUsers).map(([_, user]) => user))
}

export function getRelationship(
  ref: ControlRef,
  user: IUser
): RelationshipType {
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
  await waitFor(() => [ref.current.followingUserIdsHasFetched], {
    log: logScheduler,
    resourceName: 'follower list',
    intervalTime: FALSE_START_WAIT_INTERVAL,
  })
  await waitFor(() => [ref.current.followingUserIdsHasFetched], {
    log: logScheduler,
    resourceName: 'users map',
    intervalTime: FALSE_START_WAIT_INTERVAL,
  })

  // If rawler indexer is already running skip
  if (ref.current.tokens.userIndexer) {
    logScheduler(`Indexer already running, skipping`)
  } else {
    logScheduler(`Indexer starting`)
    workerUserIndexer(ref)
  }
}

let interval = null

export async function scheduleUserIndexer(ref: ControlRef): Promise<any> {
  log('Starting scheduler')

  // Give the page render requests a few seconds to complete
  await wait(3000)

  maybeRunUserIndexer(ref)

  clearInterval(interval)
  interval = setInterval(() => {
    maybeRunUserIndexer(ref)
  }, SCHEDULE_INTERVAL_INDEXER)
}

export const i = 0
