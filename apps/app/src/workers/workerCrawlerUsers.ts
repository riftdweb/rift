import * as CAF from 'caf'
import { createLogger } from '../shared/logger'
import { ControlRef } from '../contexts/skynet/useControlRef'
import { fetchAllEntries, needsRefresh } from './shared'
import { workerFeedUserUpdate } from './workerFeedUser'
import { EntryFeed, WorkerParams } from '@riftdweb/types'
import { clearToken, handleToken } from './tokens'
import { wait } from '../shared/wait'
import { v4 as uuid } from 'uuid'

const SCHEDULE_INTERVAL_CRAWLER = 1000 * 60 * 5
const FALSE_START_WAIT_INTERVAL = 1000 * 2
const REFRESH_INTERVAL_CRAWLER = 0

const cafCrawlerUsers = CAF(function* crawlerUsers(
  signal: any,
  ref: ControlRef,
  params: WorkerParams
): Generator<Promise<EntryFeed | string[]>, any, any> {
  const log = createLogger('crawler/users', {
    workflowId: params.workflowId,
  })
  let userWorkers = []
  try {
    log('Running')
    const myUserId = ref.current.myUserId

    log('Checking feed status')
    ref.current.feeds.latest.setLoadingState('Checking feed status')
    let allEntriesFeed = yield fetchAllEntries(ref)

    if (
      !params.force &&
      !needsRefresh(allEntriesFeed, REFRESH_INTERVAL_CRAWLER)
    ) {
      log('Up to date')
      ref.current.feeds.latest.setLoadingState('')
      return
    }

    log('Fetching following')
    let followingUserIds = ref.current.followingUserIds.data || []

    // If no entries exist yet and following at least 1 user
    // Probably a new user, so render onboarding message in feed UI
    if (!allEntriesFeed.entries.length && followingUserIds.length) {
      ref.current.feeds.top.setLoadingState('Building your feed')
      ref.current.feeds.latest.setLoadingState('Building your feed')
    } else {
      ref.current.feeds.latest.setLoadingState('')
    }

    // // If no entries exist yet and not followings anyone
    // if (!allEntriesFeed.entries.length && !followingUserIds.length) {
    //   ref.current.setNonIdealState('Follow some users to get started!')
    //   return
    // }

    if (myUserId) {
      followingUserIds = [myUserId, ...followingUserIds]
    }

    userWorkers = followingUserIds.map((userId) =>
      workerFeedUserUpdate(ref, userId)
    )

    log('Returning')
    return
  } finally {
    log('Finally')
    if (signal.aborted) {
      log('Aborted')
    }

    yield Promise.all(userWorkers)
    // Only clear loading states if no downstream worker has set a new state
    // This will only occur if no followings have any data
    if (ref.current.feeds.latest.loadingState === 'Building your feed') {
      ref.current.feeds.latest.setLoadingState('')
    }
    if (ref.current.feeds.top.loadingState === 'Building your feed') {
      ref.current.feeds.top.setLoadingState('')
    }
  }
})

export async function workerCrawlerUsers(
  ref: ControlRef,
  params: WorkerParams = {}
): Promise<any> {
  const workflowId = uuid()
  const log = createLogger('crawler/users', {
    workflowId,
  })
  const token = await handleToken(ref, 'crawlerUsers')
  try {
    await cafCrawlerUsers(token.signal, ref, {
      ...params,
      workflowId,
    })
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  } finally {
    clearToken(ref, 'crawlerUsers')
  }
}

const logScheduler = createLogger('crawler/users/scheduler')

async function maybeRunCrawlerUsers(ref: ControlRef): Promise<any> {
  // If crawler is already running skip
  if (!ref.current.followingUserIdsHasFetched) {
    logScheduler(
      `Follower list not ready, trying again in ${
        FALSE_START_WAIT_INTERVAL / 1000
      } seconds`
    )
    setTimeout(() => {
      maybeRunCrawlerUsers(ref)
    }, FALSE_START_WAIT_INTERVAL)
  }
  // If crawler is already running skip
  else if (ref.current.tokens.crawlerUsers) {
    logScheduler(`Crawler already running, skipping`)
  } else {
    logScheduler(`Crawler starting`)
    workerCrawlerUsers(ref)
  }
}

let interval = null

export async function scheduleCrawlerUsers(ref: ControlRef): Promise<any> {
  logScheduler('Starting scheduler')

  // Give the page render requests a few seconds to complete
  await wait(3000)

  maybeRunCrawlerUsers(ref)

  clearInterval(interval)
  interval = setInterval(() => {
    maybeRunCrawlerUsers(ref)
  }, SCHEDULE_INTERVAL_CRAWLER)
}
