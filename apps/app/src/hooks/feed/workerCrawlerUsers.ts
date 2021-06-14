import * as CAF from 'caf'
import { logger } from '../../shared/logger'
import { socialDAC } from '../skynet'
import { ControlRef } from '../skynet/useControlRef'
import { suggestionUserIds } from '../users'
import { fetchAllEntries, fetchUserEntries, needsRefresh } from './shared'
import { workerFeedUserUpdate } from './workerFeedUser'
import { EntryFeed } from './types'
import { handleToken } from './tokens'

const SCHEDULE_INTERVAL_CRAWLER = 5 * 60
const REFRESH_INTERVAL_CRAWLER = 0
const REFRESH_INTERVAL_USER = 0

type Params = {
  force?: boolean
}

const cafCrawlerUsers = CAF(function* crawlerUsers(
  signal: any,
  ref: ControlRef,
  params: Params = {}
): Generator<Promise<EntryFeed | string[]>, any, any> {
  function log(...args) {
    logger('crawlerUsers', ...args)
  }

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
    ref.current.feeds.latest.setLoadingState('')

    log('Fetching following')
    let followingUserIds = suggestionUserIds.slice(0, 2)

    if (myUserId) {
      followingUserIds = yield socialDAC.getFollowingForUser(myUserId)
      followingUserIds = [myUserId, ...followingUserIds]
    }

    for (let userId of followingUserIds) {
      log(`Fetching cached entries for user ${userId}`)
      let userFeed = yield fetchUserEntries(ref, userId)

      if (!needsRefresh(userFeed, REFRESH_INTERVAL_USER)) {
        log(`User ${userId} is up to date`)
        continue
      }

      yield workerFeedUserUpdate(ref, userId, userFeed)
    }

    log('Returning')
    return
  } finally {
    log('Finally')
    if (signal.aborted) {
      log('Aborted')
    }
    ref.current.feeds.latest.setLoadingState('')
  }
})

export async function workerCrawlerUsers(
  ref: ControlRef,
  params: Params = {}
): Promise<any> {
  const token = await handleToken(ref, 'crawlerUsers')
  return cafCrawlerUsers(token.signal, ref, params)
}

export async function scheduleCrawlerUsers(ref: ControlRef): Promise<any> {
  function log(...args) {
    logger('scheduleCrawlerUsers', ...args)
  }

  workerCrawlerUsers(ref)

  setInterval(() => {
    // TODO: ADD CHECK FOR USER POST IN PROGRESS

    // If crawler is already running skip
    if (ref.current.tokens.crawlerUsers?.signal) {
      log('crawler already running, skipping')
    } else {
      workerCrawlerUsers(ref)
    }
  }, SCHEDULE_INTERVAL_CRAWLER * 1000)
}
