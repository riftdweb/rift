import * as CAF from 'caf'
import { createLogger } from '../shared/logger'
import { ControlRef } from '../contexts/skynet/ref'
import uniq from 'lodash/uniq'
import { EntryFeed, IUser, UsersMap, WorkerParams } from '@riftdweb/types'
import { clearToken, handleToken } from './tokens'
import { wait } from '../shared/wait'
import { fetchUser } from '../hooks/useProfile'
import { TaskQueue } from '../shared/taskQueue'

const SCHEDULE_INTERVAL_CRAWLER = 1000 * 60 * 5
const FALSE_START_WAIT_INTERVAL = 1000 * 2
const REFRESH_INTERVAL_CRAWLER = 0

const BATCH_SIZE = 1

const taskQueue = TaskQueue('usersIndex', {
  poolSize: 1,
})

const log = createLogger('crawler/network')
const cafCrawlerNetwork = CAF(function* crawlerNetwork(
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
        const task = async () =>
          fetchUser(ref, userId, {
            syncUpdate: true,
            skipUpsert: true,
          })
        return taskQueue.add(task)
      })
      const updatedUsers: IUser[] = yield Promise.all(tasks)

      ref.current.upsertUsers(updatedUsers)

      const userIdsToAdd = []
      // Crawl the discovered followingIds
      updatedUsers.forEach((newItem) => {
        userIdsToAdd.push(...newItem.followingIds)
      })

      ref.current.addNewUserIds(userIdsToAdd)
      recomputeFollowers(ref)
    }

    log('Calculating followerIds')

    log('Done')

    log('Returning')
    return
  } finally {
    log('Finally')
    if (signal.aborted) {
      log('Aborted')
    }
  }
})

// const checkIsFollowingUser = useCallback(
//   (userId: string) => {
//     // Use followings instead of followingUserIds in case there is an inflight optimistic update
//     return !!followings.data?.entries.find((user) => user.userId === userId)
//   },
//   [followings]
// )
// const checkIsFollowerUser = useCallback(
//   (userId: string) => {
//     return usersMap.data?.entries[userId].followingIds?.includes(myUserId)
//   },
//   [myUserId, usersMap]
// )
function recomputeFollowers(ref) {
  log('Recomputing followers')
  const updatedUsers: Record<string, IUser> = {}
  ref.current.usersIndex.forEach((user) => {
    // Update users followers
    for (let followingId of user.followingIds) {
      let followingUser =
        updatedUsers[followingId] || ref.current.getUser(followingId)
      if (followingUser) {
        followingUser = {
          ...followingUser,
          followerIds: uniq([...followingUser.followerIds, user.userId]),
        }
        updatedUsers[followingId] = followingUser
      }
    }

    // Update relationship
    let updatedUser =
      updatedUsers[user.userId] || ref.current.getUser(user.userId)

    const relationship = getRelationship(ref, updatedUser)

    updatedUsers[user.userId] = {
      ...updatedUser,
      relationship,
    }
  })
  ref.current.upsertUsers(Object.entries(updatedUsers).map(([_, user]) => user))
}

export function getRelationship(
  ref: ControlRef,
  user: IUser
): IUser['relationship'] {
  const followsMe = user.followingIds.includes(ref.current.myUserId)
  const iFollow = user.followerIds.includes(ref.current.myUserId)

  let relationship: IUser['relationship'] = 'none'

  if (followsMe && iFollow) {
    relationship = 'friend'
  } else if (followsMe) {
    relationship = 'follower'
  } else if (iFollow) {
    relationship = 'following'
  }
  return relationship
}

export async function workerCrawlerNetwork(
  ref: ControlRef,
  params: WorkerParams = {}
): Promise<any> {
  const token = await handleToken(ref, 'crawlerNetwork')
  try {
    await cafCrawlerNetwork(token.signal, ref, params)
  } catch (e) {
    log(e)
  } finally {
    clearToken(ref, 'crawlerNetwork')
  }
}

const logScheduler = createLogger('crawler/network/schedule')

async function maybeRunCrawlerNetwork(ref: ControlRef): Promise<any> {
  // If crawler is already running skip
  if (!ref.current.followingUserIdsHasFetched) {
    logScheduler(
      `Follower list not ready, trying again in ${
        FALSE_START_WAIT_INTERVAL / 1000
      } seconds`
    )
    setTimeout(() => {
      maybeRunCrawlerNetwork(ref)
    }, FALSE_START_WAIT_INTERVAL)
  } else if (!ref.current.usersMap.data) {
    logScheduler(
      `Users map not ready, trying again in ${
        FALSE_START_WAIT_INTERVAL / 1000
      } seconds`
    )
    setTimeout(() => {
      maybeRunCrawlerNetwork(ref)
    }, FALSE_START_WAIT_INTERVAL)
  }
  // If crawler is already running skip
  else if (ref.current.tokens.crawlerNetwork) {
    logScheduler(`Crawler already running, skipping`)
  } else {
    logScheduler(`Crawler starting`)
    workerCrawlerNetwork(ref)
  }
}

let interval = null

export async function scheduleCrawlerNetwork(ref: ControlRef): Promise<any> {
  log('Starting scheduler')

  // Give the page render requests a few seconds to complete
  await wait(3000)

  maybeRunCrawlerNetwork(ref)

  clearInterval(interval)
  interval = setInterval(() => {
    maybeRunCrawlerNetwork(ref)
  }, SCHEDULE_INTERVAL_CRAWLER)
}

export const i = 0
