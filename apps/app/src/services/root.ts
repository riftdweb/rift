import { createLogger } from '@riftdweb/logger'
import { ControlRef } from '../contexts/skynet/ref'
import { clearAllTokens } from './tokens'
import { scheduleFeedAggregator } from './feedAggregator'
import { scheduleUsersIndexer } from './usersIndexer'

const log = createLogger('root')

export async function startRoot(ref: ControlRef): Promise<any> {
  log('Running')

  log('Clearing any existing services')
  clearAllTokens(ref)

  log('Starting users indexer')
  await scheduleUsersIndexer(ref)

  log('Starting feed latest updater')
  await scheduleFeedAggregator(ref)

  log('Finished')
  return
}
