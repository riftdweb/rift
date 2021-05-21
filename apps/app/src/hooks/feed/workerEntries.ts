import { globals } from '../../shared/globals'
import { logger } from '../../shared/logger'
import { socialDAC } from '../skynet'
import {
  cacheAllEntries,
  cacheUserEntries,
  fetchAllEntries,
  compileUserEntries,
  upsertAllEntries,
  fetchUserEntries,
  needsRefresh,
} from './shared'
import { EntryFeed } from './types'
import { workerFeed } from './workerFeed'

function log(...args) {
  logger('workerEntries', ...args)
}

export async function workerEntries(): Promise<EntryFeed> {
  log('Running')
  const myUserId = globals.userId

  log('Fetching all entries')
  let allEntriesFeed = await fetchAllEntries()
  let allEntries = allEntriesFeed.entries

  if (!needsRefresh(allEntriesFeed)) {
    log('Up to date')
    return
  }

  log('Fetching following')
  const followingUserIds = await socialDAC.getFollowingForUser(myUserId)

  for (let userId of [myUserId, ...followingUserIds]) {
    log(`Fetching cached entries for user ${userId}`)
    let userEntries = await fetchUserEntries(userId)

    if (!needsRefresh(userEntries, 5)) {
      log(`User ${userId} is up to date`)
      allEntries = upsertAllEntries(allEntries, userEntries.entries)
      continue
    }
    log(`Compiling entries for user ${userId}`)
    let allUserEntries = await compileUserEntries(userId)

    log(`Caching entries for user ${userId}`)
    await cacheUserEntries(userId, allUserEntries)

    allEntries = upsertAllEntries(allEntries, allUserEntries)
  }

  log('Caching all entries')
  await cacheAllEntries(allEntries)

  // Start Feeed worker, do not wait
  log('Starting Feed worker')
  workerFeed()

  log('Returning')
  return {
    updatedAt: new Date().getTime(),
    entries: allEntries,
  }
}

function logUser(...args) {
  logger('workerRemoveUserData', ...args)
}

export async function removeUserData(userId: string) {
  logUser('Running')
  logUser('Fetching all entries')
  let allEntriesFeed = await fetchAllEntries()
  let entries = allEntriesFeed.entries.filter(
    (entry) => entry.userId !== userId
  )

  logUser('Caching all entries')
  await cacheAllEntries(entries)

  logUser('Returning')
  return entries
}

function logUpdateUser(...args) {
  logger('workerUpdateUserData', ...args)
}

export async function updateUserData(userId) {
  logUpdateUser('Running')

  logUpdateUser('Fetching all entries')
  let allEntriesFeed = await fetchAllEntries()
  let allEntries = allEntriesFeed.entries

  logUpdateUser(`Compiling entries for user ${userId}`)
  let allUserEntries = await compileUserEntries(userId)

  logUpdateUser(`Caching entries for user ${userId}`)
  await cacheUserEntries(userId, allUserEntries)

  allEntries = upsertAllEntries(allEntries, allUserEntries)

  logUpdateUser('Caching all entries')
  await cacheAllEntries(allEntries)

  // Start Feeed worker, do not wait
  logUpdateUser('Starting Feed worker')
  workerFeed()

  logUpdateUser('Returning')
  return {
    updatedAt: new Date().getTime(),
    entries: allEntries,
  }
}
