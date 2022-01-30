import { initSkynetService } from './account'
import { initStores } from '../stores'

export { scoreEntry } from './feeds/scoreEntries'
export { syncUser, checkIsUserUpToDate } from './syncUser'
export { startRoot } from './root'
export {
  emptyFeed,
  emptyActivityFeed,
  cacheUserEntries,
  upsertAllEntries,
  fetchAllEntries,
  fetchUserEntries,
  fetchTopEntries,
  fetchActivity,
  cacheAllEntries,
  compileUserEntries,
  cacheTopEntries,
  cacheActivity,
  fetchUsersMap,
  cacheUsersMap,
  needsRefresh,
} from './serviceApi'
export { handleToken, clearAllTokens, clearToken } from './tokens'

export async function initServices(userId = 'rift') {
  await initStores()
  await initSkynetService()
  // await initUsersService()
}
