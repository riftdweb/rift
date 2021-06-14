import * as CAF from 'caf'
import { JSONResponse } from 'skynet-js'
import { logger } from '../../shared/logger'
import { ControlRef } from '../skynet/useControlRef'
import {
  cacheUserEntries,
  compileUserEntries,
  fetchUserEntries,
} from './shared'
import { handleToken } from './tokens'
import { Entry, EntryFeed } from './types'
import { workerFeedActivityUpdate } from './workerFeedActivity'
import { workerFeedLatestUpdate } from './workerFeedLatest'
import { workerFeedTopUpdate } from './workerFeedTop'

/**
 *  If feedUserUpdate finds new data, it will trigger:
 *    1. updateFeedLatest
 *    2. And then async after in parallel:
 *      - updateFeedTop
 *      - updateFeedActivity
 */
export const cafFeedUserUpdate = CAF(function* feedUserUpdate(
  signal: any,
  ref: ControlRef,
  userId: string,
  userFeed?: EntryFeed
): Generator<Promise<EntryFeed | Entry[] | JSONResponse>, any, any> {
  function log(...args) {
    logger('feedUserUpdate', ...args)
  }

  try {
    log('Running')
    ref.current.feeds.user.setLoadingState(userId, 'Compiling feed')

    // If caller already fetched the userFeed no need to fetch
    if (!userFeed) {
      userFeed = yield fetchUserEntries(ref, userId)
    }
    let existingUserEntries = userFeed.entries

    log(`Compiling entries for user ${userId}`)
    let newUserEntries: Entry[] = yield compileUserEntries(userId)

    log(`Caching entries for user ${userId}`)
    ref.current.feeds.user.setLoadingState(userId, 'Caching feed')
    yield cacheUserEntries(ref, userId, newUserEntries)

    const newEntryExists = newUserEntries.find(
      (entry) =>
        !existingUserEntries.find(
          (existingEntry) => existingEntry.id === entry.id
        )
    )

    // If there are any new entries trigger update sequence
    // if (newEntryExists) {
    // Do not wait
    workerAfterFeedUserUpdate(ref, userId, {
      updatedAt: new Date().getTime(),
      entries: newUserEntries,
    })
    // }

    log('Trigger mutate')
    ref.current.feeds.user.setLoadingState(userId, 'Fetching feed')
    const viewingUserId = ref.current.viewingUserId
    if (userId === viewingUserId) {
      yield ref.current.feeds.user.response.mutate()
    }
    ref.current.feeds.user.setLoadingState(userId, '')

    log('Returning')
  } finally {
    log('Finally')
    if (signal.aborted) {
      log('Aborted')
    }
    ref.current.feeds.user.setLoadingState(userId, '')
  }
})

// Method capturing all the downstream updates that should take place after
// a followed user's data has been updated.
const cafAfterFeedUserUpdate = CAF(function* afterFeedUserUpdate(
  signal: any,
  ref: ControlRef,
  userId: string,
  userFeed: EntryFeed
) {
  function log(...args) {
    logger('afterFeedUserUpdate', ...args)
  }
  try {
    log('Running')
    const myUserId = ref.current.userId
    const isSelf = myUserId === userId
    const isFollowingUser = !!ref.current.followings.find(
      (user) => user.userId === userId
    )

    // If following user, update the latest feed
    if (isSelf || isFollowingUser) {
      yield workerFeedLatestUpdate(ref, userId, userFeed)
    }

    log('Starting feedTopUpdate and feedActivityUpdate')
    // Do not return, so consumers do not wait for these downstream updates
    Promise.all([
      workerFeedTopUpdate(ref, { force: true }),
      workerFeedActivityUpdate(ref, { force: true }),
    ])
  } finally {
    log('Finally')
    if (signal.aborted) {
      log('Aborted')
    }
  }
})

export async function workerFeedUserUpdate(
  ref: ControlRef,
  userId: string,
  userFeed?: EntryFeed
): Promise<any> {
  const token = await handleToken(ref, 'feedUserUpdate')
  return cafFeedUserUpdate(token.signal, ref, userId, userFeed)
}

export async function workerAfterFeedUserUpdate(
  ref: ControlRef,
  userId: string,
  userFeed: EntryFeed
): Promise<any> {
  const token = await handleToken(ref, 'afterFeedUserUpdate')
  return cafAfterFeedUserUpdate(token.signal, ref, userId, userFeed)
}
