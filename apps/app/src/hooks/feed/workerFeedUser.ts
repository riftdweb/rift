import { logger } from '../../shared/logger'
import { ControlRef } from '../skynet/useControlRef'
import {
  cacheAllEntries,
  cacheUserEntries,
  fetchAllEntries,
  compileUserEntries,
  upsertAllEntries,
} from './shared'
import { Entry } from './types'
import { workerFeedTop } from './workerFeedTop'

function logRemoveUser(...args) {
  logger('workerRemoveUserData', ...args)
}

export async function removeUserData(ref: ControlRef, userId: string) {
  logRemoveUser('Running')
  ref.current.feeds.user.setLoadingState('Compiling')

  logRemoveUser('Fetching all entries')
  let allEntriesFeed = await fetchAllEntries(ref)
  let entries = allEntriesFeed.entries.filter(
    (entry) => entry.userId !== userId
  )

  logRemoveUser('Caching all entries')
  await cacheAllEntries(ref, entries)

  logRemoveUser('Returning')
  return entries
}

function logUpdateUser(...args) {
  logger('workerUpdateUserData', ...args)
}

export async function updateUserData(ref: ControlRef, userId: string) {
  logUpdateUser('Running')
  const myUserId = ref.current.userId
  const viewingUserId = ref.current.viewingUserId
  const isSelf = myUserId === userId
  const isFollowingUser = !!ref.current.followings.find(
    (user) => user.userId === userId
  )
  ref.current.feeds.user.setLoadingState(userId, 'Compiling feed')

  logUpdateUser(`Compiling entries for user ${userId}`)
  let allUserEntries = await compileUserEntries(userId)
  logUpdateUser(allUserEntries)

  logUpdateUser(`Caching entries for user ${userId}`)
  ref.current.feeds.user.setLoadingState(userId, 'Caching feed')
  await cacheUserEntries(ref, userId, allUserEntries)

  // If following user, update the latest feed
  if (isSelf || isFollowingUser) {
    // Fork off async process to update latest feed
    addUserEntriesToLatestFeed(ref, userId, allUserEntries)
  }

  logUpdateUser('Trigger mutate')

  ref.current.feeds.user.setLoadingState(userId, 'Fetching feed')
  if (userId === viewingUserId) {
    await ref.current.feeds.user.response.mutate()
  }
  await ref.current.feeds.user.setLoadingState(userId)

  // Start Feeed worker, do not wait
  logUpdateUser('Starting Feed worker')
  workerFeedTop(ref, { force: true })

  logUpdateUser('Returning')
  return {
    updatedAt: new Date().getTime(),
    entries: allUserEntries,
  }
}

async function addUserEntriesToLatestFeed(
  ref: ControlRef,
  userId: string,
  allUserEntries: Entry[]
) {
  logUpdateUser('Fetching all entries')
  ref.current.feeds.latest.setLoadingState('Compiling feed')
  let allEntriesFeed = await fetchAllEntries(ref)
  let allEntries = allEntriesFeed.entries

  // Remove existing user entries
  allEntries = allEntries.filter((entry) => entry.userId !== userId)

  // Add new user entries
  allEntries = upsertAllEntries(allEntries, allUserEntries)

  logUpdateUser('Caching all entries')
  ref.current.feeds.latest.setLoadingState('Caching feed')
  await cacheAllEntries(ref, allEntries)

  logUpdateUser('Fetching feed')
  ref.current.feeds.latest.setLoadingState()
  // Fork off a mutate to fetch new feed
  ref.current.feeds.latest.response.mutate()
}
