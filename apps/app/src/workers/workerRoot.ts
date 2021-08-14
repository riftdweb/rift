import { createLogger } from '../shared/logger'
import { ControlRef } from '../contexts/skynet/ref'
import { clearAllTokens } from './tokens'
import { scheduleFeedLatestUpdate } from './workerFeedLatest'
import { scheduleFeedIndexer } from './workerFeedIndexer'
import { scheduleUserIndexer } from './workerUsersIndexer'

const log = createLogger('root')

export async function workerRoot(ref: ControlRef): Promise<any> {
  log('Running')

  log('Clearing any existing workers')
  clearAllTokens(ref)

  // log('Starting feed indexer')
  await scheduleFeedIndexer(ref)

  // log('Starting user indexer')
  await scheduleUserIndexer(ref)

  log('Starting feed latest updater')
  await scheduleFeedLatestUpdate(ref)

  log('Returning')
  return
}
