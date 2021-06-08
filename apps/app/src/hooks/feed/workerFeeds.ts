import { logger } from '../../shared/logger'
import { EntryFeed } from './types'
import { workerFeedTop } from './workerFeedTop'
import { workerFeedAll } from './workerFeedAll'
import { workerFeedActivity } from './workerFeedActivity'
import { ControlRef } from '../skynet/useControlRef'

function log(...args) {
  logger('workerFeeds', ...args)
}

export async function workerFeeds(ref: ControlRef): Promise<EntryFeed> {
  log('Running')
  // ref.current.setLoadingState()
  const entryFeed = await workerFeedAll(ref)

  // Start Feeed worker, do not wait
  log('Starting Feed worker')
  workerFeedTop(ref)

  // Start Feeed worker, do not wait
  log('Starting Activity worker')
  workerFeedActivity(ref)

  ref.current.setLoadingState()

  log('Returning')
  return entryFeed
}
