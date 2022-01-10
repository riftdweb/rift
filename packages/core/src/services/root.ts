import { createLogger } from '@riftdweb/logger'
import { clearAllTokens } from './tokens'
import { scheduleUsersIndexer } from './usersIndexer'
import { getItem } from '../shared/localStorage'

const disableBackgroundServices = getItem('disableBackgroundServices')

const log = createLogger('root')

export async function startRoot(): Promise<any> {
  log('Running')

  log('Clearing any existing services')
  clearAllTokens()

  if (disableBackgroundServices) {
    log('Background services disabled')
  } else {
    log('Starting users indexer')
    await scheduleUsersIndexer()
  }

  log('Finished')
  return
}
