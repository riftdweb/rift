import * as CAF from 'caf'
import { createLogger } from '../../shared/logger'
import { ControlRef } from '../skynet/useControlRef'
import { fetchAllEntries, needsRefresh } from './shared'
import { workerFeedUserUpdate } from './workerFeedUser'
import { EntryFeed, WorkerParams } from './types'
import { clearAllTokens, clearToken, handleToken } from './tokens'

const SCHEDULE_INTERVAL_CRAWLER = 1000 * 60 * 5
const REFRESH_INTERVAL_CRAWLER = 0

const log = createLogger('crawler/users')
const cafCrawlerUsers = CAF(function* crawlerUsers(
  signal: any,
  ref: ControlRef,
  params: WorkerParams = {}
): Generator<Promise<EntryFeed | string[]>, any, any> {
  try {
    log('Running')
    const myUserId = ref.current.userId

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

    for (let userId of followingUserIds) {
      yield workerFeedUserUpdate(ref, userId)
    }

    log('Returning')
    return
  } finally {
    log('Finally')
    if (signal.aborted) {
      log('Aborted')
    }
    // clearToken(ref, 'crawlerUsers')
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
  const token = await handleToken(ref, 'crawlerUsers')
  try {
    await cafCrawlerUsers(token.signal, ref, params)
  } catch (e) {
    log('Error', e)
  } finally {
    clearToken(ref, 'crawlerUsers')
  }
}

const logScheduler = createLogger('crawler/users/schedule')

async function maybeRunCrawlerUsers(ref: ControlRef): Promise<any> {
  // TODO: ADD CHECK FOR USER POST IN PROGRESS

  // If crawler is already running skip
  if (ref.current.tokens.crawlerUsers) {
    logScheduler(`Crawler already running, skipping`)
  } else {
    logScheduler(`Crawler starting`)
    await clearAllTokens(ref)
    workerCrawlerUsers(ref)
  }
}

let interval = null

export async function scheduleCrawlerUsers(ref: ControlRef): Promise<any> {
  log('Starting scheduler')
  // Try running the crawler a few times in case followings list has not loaded
  // If followings have not loaded the list is only the users own ID, so this
  // first run will finish quickly
  maybeRunCrawlerUsers(ref)

  setTimeout(async () => {
    maybeRunCrawlerUsers(ref)
  }, 5000)

  setTimeout(async () => {
    maybeRunCrawlerUsers(ref)
  }, 10_000)

  setTimeout(async () => {
    maybeRunCrawlerUsers(ref)
  }, 20_000)

  clearInterval(interval)

  interval = setInterval(() => {
    maybeRunCrawlerUsers(ref)
  }, SCHEDULE_INTERVAL_CRAWLER)
}
