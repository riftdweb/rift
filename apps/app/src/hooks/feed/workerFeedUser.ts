import * as CAF from 'caf'
import { JSONResponse } from 'skynet-js'
import { createLogger } from '../../shared/logger'
import { RequestQueue } from '../../shared/requestQueue'
import { ControlRef } from '../skynet/useControlRef'
import {
  cacheUserEntries,
  compileUserEntries,
  fetchUserEntries,
  needsRefresh,
} from './shared'
import { clearToken, handleToken } from './tokens'
import { Entry, EntryFeed, WorkerParams } from './types'
import { feedLatestAdd } from './workerFeedLatest'

const REFRESH_INTERVAL_USER = 4

const requestQueue = RequestQueue('feed/user', 5)

const cafFeedUserUpdate = CAF(function* feedUserUpdate(
  signal: any,
  ref: ControlRef,
  userId: string,
  params: WorkerParams
): Generator<Promise<EntryFeed | Entry[] | JSONResponse | void>, any, any> {
  const shortUserId = userId.slice(0, 5)
  const log = createLogger(`feed/user/${shortUserId}/update`)

  try {
    log('Running')
    ref.current.feeds.user.setLoadingState(userId, 'Compiling feed')

    // If caller already fetched the userFeed no need to fetch
    log('Fetching cached entries')
    const userFeed = yield fetchUserEntries(ref, userId)

    if (!params.force && !needsRefresh(userFeed, REFRESH_INTERVAL_USER)) {
      log('Up to date')
      return
    }

    log('Compiling entries')
    let compiledUserEntries: Entry[] = yield compileUserEntries(userId)

    log('Caching entries')
    ref.current.feeds.user.setLoadingState(userId, 'Caching feed')
    yield cacheUserEntries(ref, userId, compiledUserEntries)

    log('Maybe mutate')
    ref.current.feeds.user.setLoadingState(userId, 'Fetching feed')
    const viewingUserId = ref.current.viewingUserId
    if (userId === viewingUserId) {
      log('Trigger mutate')
      yield ref.current.feeds.user.response.mutate()
    }

    // Check to see if the latest feed needs to be updated
    const existingEntries = ref.current.feeds.latest.response.data?.entries
    const newEntries = compiledUserEntries.filter(
      (entry) =>
        !existingEntries.find((existingEntry) => existingEntry.id === entry.id)
    )
    const entriesNeedToBeAddedToLatest = !!newEntries.length

    // If there are not any new entries skip update sequence
    if (!entriesNeedToBeAddedToLatest) {
      log('No new entries')
      return
    }
    log(`New entries: ${newEntries.length}`)

    const myUserId = ref.current.myUserId
    const isSelf = myUserId === userId
    const isFollowingUser = !!ref.current.followingUserIds.data?.find(
      (followingUserId) => followingUserId === userId
    )

    // If following user, update the latest feed
    if (isSelf || isFollowingUser) {
      // TODO: Running this function is not captured in the user feed updatedAt timestamp.
      // If the user worker gets canceled, this may lead to user entries that do not
      // make it into the main feeds until the next update cycle.
      // Solution: Backdate the timestamp in finally clause?
      feedLatestAdd(compiledUserEntries)
    }

    log('Returning')
  } finally {
    log('Finally')
    if (signal.aborted) {
      log('Aborted')
    }
    clearToken(ref, `feedUserUpdate/${userId}`)
    ref.current.feeds.user.setLoadingState(userId, '')
  }
})

export async function feedUserUpdate(
  ref: ControlRef,
  userId: string,
  params: WorkerParams = {}
): Promise<any> {
  const shortUserId = userId.slice(0, 5)
  const log = createLogger(`feed/user/${shortUserId}/update`)
  const token = await handleToken(ref, `feedUserUpdate/${userId}`)
  try {
    await cafFeedUserUpdate(token.signal, ref, userId, params)
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  }
}

export async function workerFeedUserUpdate(
  ref: ControlRef,
  userId: string,
  params: WorkerParams = {}
): Promise<any> {
  const task = () => feedUserUpdate(ref, userId, params)
  if (params.prioritize) {
    await requestQueue.prepend(task)
  } else {
    await requestQueue.append(task)
  }
}
