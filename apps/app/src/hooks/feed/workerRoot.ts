import { createLogger } from '../../shared/logger'
import { scheduleCrawlerUsers } from './workerCrawlerUsers'
import { ControlRef } from '../skynet/useControlRef'
import { clearAllTokens } from './tokens'

/**
 *  Background process
 *  - Start workerUserCrawler which for checks each user for new data in the background.
 *  - If user makes a post, cancel the updateFeedLatest and updateUserData workers,
 *  as we do not want anything running that may reset feeds that contain the new post
 *  until it has fully saved to Skynet feed caches.
 *  On a succcess save, restart updateFeedLatest. Other workers such as updateFeedTop or
 *  updateFeedActivity can finish their runs as they will not interfere with the UX of a
 *  pending post.
 */

const log = createLogger('root')

export async function workerRoot(ref: ControlRef): Promise<any> {
  log('Running')

  log('Clearing any existing workers')
  clearAllTokens(ref)

  log('Starting users crawler')
  await scheduleCrawlerUsers(ref)

  log('Returning')
  return
}
