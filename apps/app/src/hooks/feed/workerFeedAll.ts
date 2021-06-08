import { logger } from '../../shared/logger'
import { socialDAC } from '../skynet'
import { ControlRef } from '../skynet/useControlRef'
import { suggestionUserIds } from '../users'
import { fetchAllEntries, fetchUserEntries, needsRefresh } from './shared'
import { EntryFeed } from './types'
import { updateUserData } from './workerFeedUser'
// import { CAF } from 'caf'

function log(...args) {
  logger('workerFeedAll', ...args)
}

type Params = {
  force?: boolean
}
// var token = new CAF.cancelToken();

// // wrap a generator to make it look like a normal async
// // function that when called, returns a promise.
// var main = CAF( function *main(signal,url){
//     var resp = yield ajax( url );

//     // want to be able to cancel so we never get here?!?
//     console.log( resp );
//     return resp;
// } );

export async function workerFeedAll(
  ref: ControlRef,
  params: Params = {}
): Promise<EntryFeed> {
  log('Running')
  const myUserId = ref.current.userId

  ref.current.feeds.latest.setLoadingState('Checking feed status')

  log('Fetching all entries')
  let allEntriesFeed = await fetchAllEntries(ref)
  let allEntries = allEntriesFeed.entries

  if (!params.force && !needsRefresh(allEntriesFeed)) {
    log('Up to date')
    ref.current.feeds.latest.setLoadingState()
    return
  }
  ref.current.feeds.latest.setLoadingState()

  log('Fetching following')
  let followingUserIds = suggestionUserIds.slice(0, 2)

  if (myUserId) {
    followingUserIds = await socialDAC.getFollowingForUser(myUserId)
    followingUserIds = [myUserId, ...followingUserIds]
  }

  for (let userId of followingUserIds) {
    log(`Fetching cached entries for user ${userId}`)
    let userEntries = await fetchUserEntries(ref, userId)

    if (!needsRefresh(userEntries, 5)) {
      log(`User ${userId} is up to date`)
      // allEntries = upsertAllEntries(allEntries, userEntries.entries)
      continue
    }

    await updateUserData(ref, userId)
  }

  // log('Caching all entries')
  // ref.current.feeds.latest.setLoadingState('Caching feed')
  // await cacheAllEntries(ref, allEntries)

  // log('Trigger mutate')
  // ref.current.feeds.latest.setLoadingState()
  // await ref.current.feeds.latest.response.mutate()

  log('Returning')
  return {
    updatedAt: new Date().getTime(),
    entries: allEntries,
  }
}
