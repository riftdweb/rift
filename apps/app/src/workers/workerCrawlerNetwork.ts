import * as CAF from 'caf'
import { createLogger } from '../shared/logger'
import { ControlRef } from '../contexts/skynet/useControlRef'
import {
  cacheUsersIndex,
  fetchAllEntries,
  fetchUsersIndex,
  needsRefresh,
} from './shared'
import { workerFeedUserUpdate } from './workerFeedUser'
import uniq from 'lodash/uniq'
import { EntryFeed, Feed, UserItem, WorkerParams } from '@riftdweb/types'
import { clearAllTokens, clearToken, handleToken } from './tokens'
import { wait } from '../shared/wait'
import { socialDAC } from '../contexts/skynet'
import { fetchProfile } from '../hooks/useProfile'
import { knownUsers as hardcodedUsers } from '../contexts/users/all'
import { TaskQueue } from '../shared/taskQueue'

const SCHEDULE_INTERVAL_CRAWLER = 1000 * 60 * 5
const FALSE_START_WAIT_INTERVAL = 1000 * 2
const REFRESH_INTERVAL_CRAWLER = 0

type UsersIndex = Feed<UserItem>

const taskQueue = TaskQueue('usersIndex', {
  poolSize: 1,
})

const log = createLogger('crawler/network')
const cafCrawlerNetwork = CAF(function* crawlerNetwork(
  signal: any,
  ref: ControlRef,
  params: WorkerParams
): Generator<Promise<EntryFeed | string[] | void | UsersIndex>, any, any> {
  let tasks = []
  try {
    log('Running')

    log('Fetching following lists')
    const usersIndex: UsersIndex = yield fetchUsersIndex(ref)

    log('Initializing allUsers')
    ref.current.allUsers = usersIndex.entries.reduce(
      (acc, entry) => ({
        ...acc,
        [entry.userId]: entry,
      }),
      {}
    )

    let pendingUserIds = hardcodedUsers
      // .slice(0, 20)
      .filter((user) => !ref.current.allUsers[user.id])
      .map((user) => user.id)

    while (pendingUserIds.length) {
      log(`Processing: ${pendingUserIds.length}`)
      const batch = pendingUserIds.splice(0, 10)
      tasks = batch.map((userId) => {
        const task = async () => {
          const existingUserItem = ref.current.allUsers[userId]

          if (!existingUserItem) {
            const _followingIds = await socialDAC.getFollowingForUser(userId)
            const followingIds = uniq(_followingIds)
            const profile = await fetchProfile(ref, userId)

            return {
              userId,
              username: profile.username,
              profile,
              followingIds,
              followerIds: [],
            }
          } else {
            return existingUserItem
          }
        }
        return taskQueue.append(task)
      })
      const newUserItems: UserItem[] = yield Promise.all(tasks)

      log('Added', newUserItems)
      newUserItems.forEach((newItem) => {
        if (!ref.current.allUsers[newItem.userId]) {
          ref.current.allUsers[newItem.userId] = newItem
        }
        newItem.followingIds.forEach((userId) => {
          if (!ref.current.allUsers[userId]) {
            log(`Adding ${userId} for processing`)
            pendingUserIds.push(userId)
          }
        })
      })
    }

    log('Calculating followerIds')
    for (let [_userId, userItem] of Object.entries(ref.current.allUsers)) {
      for (let followingId of userItem.followingIds) {
        const user = ref.current.allUsers[followingId]

        if (user) {
          user.followerIds = uniq([...user.followerIds, userItem.userId])
        }
      }
    }

    // TODO: add batch update worker

    yield cacheUsersIndex(
      ref,
      Object.entries(ref.current.allUsers).map(([id, entry]) => entry)
    )

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
  }
  // If crawler is already running skip
  else if (ref.current.tokens.crawlerUsers) {
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
