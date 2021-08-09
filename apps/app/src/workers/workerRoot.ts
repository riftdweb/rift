import { createLogger } from '../shared/logger'
import { scheduleCrawlerUsers } from './workerCrawlerUsers'
import { ControlRef } from '../contexts/skynet/useControlRef'
import { clearAllTokens } from './tokens'
import { scheduleFeedLatestUpdate } from './workerFeedLatest'
import { scheduleCrawlerNetwork } from './workerCrawlerNetwork'

const log = createLogger('root')

export async function workerRoot(ref: ControlRef): Promise<any> {
  log('Running')

  log('Clearing any existing workers')
  clearAllTokens(ref)

  log('Starting users crawler')
  await scheduleCrawlerUsers(ref)

  // log('Starting users network crawler')
  await scheduleCrawlerNetwork(ref)

  log('Starting feed latest updater')
  await scheduleFeedLatestUpdate(ref)

  log('Returning')
  return
}
