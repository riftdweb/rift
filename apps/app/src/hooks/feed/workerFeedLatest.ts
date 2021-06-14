import * as CAF from 'caf'
import { logger } from '../../shared/logger'
import { ControlRef } from '../skynet/useControlRef'
import { cacheAllEntries, fetchAllEntries, upsertAllEntries } from './shared'
import { handleToken } from './tokens'
import { Entry, EntryFeed } from './types'
import { cafFeedUserUpdate } from './workerFeedUser'

export const cafFeedLatestUpdate = CAF(function* feedLatestUpdate(
  signal: any,
  ref: ControlRef,
  userId: string,
  allUserEntries: Entry[]
) {
  function log(...args) {
    logger('feedLatestUpdate', ...args)
  }
  try {
    log('Fetching all entries')
    ref.current.feeds.latest.setLoadingState('Compiling feed')
    let allEntriesFeed = yield fetchAllEntries(ref)
    let allEntries = allEntriesFeed.entries

    // Remove existing user entries
    allEntries = allEntries.filter((entry) => entry.userId !== userId)

    // Add new user entries
    allEntries = upsertAllEntries(allEntries, allUserEntries)

    log('Caching all entries')
    ref.current.feeds.latest.setLoadingState('Caching feed')
    yield cacheAllEntries(ref, allEntries)

    log('Fetching feed')
    ref.current.feeds.latest.setLoadingState()
    // Fork off a mutate to fetch new feed
    ref.current.feeds.latest.response.mutate()
  } finally {
    log('Finally')
    if (signal.aborted) {
      log('Aborted')
    }
    ref.current.feeds.latest.setLoadingState()
  }
})

export async function workerFeedLatestUpdate(
  ref: ControlRef,
  userId: string,
  userFeed?: EntryFeed
): Promise<any> {
  logger('herehere')
  const token = await handleToken(ref, 'feedLatestUpdate')
  return cafFeedUserUpdate(token.signal, ref, userId, userFeed)
}
