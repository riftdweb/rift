import { createLogger } from '../../shared/logger'
import { ControlRef } from '../skynet/useControlRef'
import {
  cacheActivity,
  fetchActivity,
  fetchAllEntries,
  needsRefresh,
} from './shared'
import { Activity, ActivityFeed, Entry, WorkerParams } from './types'

const log = createLogger('feed/activity/update')

export async function workerFeedActivityUpdate(
  ref: ControlRef,
  params: WorkerParams = {}
): Promise<ActivityFeed> {
  const { force = false } = params

  try {
    log('Running')
    ref.current.feeds.activity.setLoadingState('Compiling')

    if (!force) {
      log('Fetching cached activity')
      let feed = await fetchActivity(ref)

      if (!needsRefresh(feed, 5)) {
        log('Up to date')
        ref.current.feeds.activity.setLoadingState()
        return
      }
    }

    log('Fetching cached entries')
    let allEntriesFeed = await fetchAllEntries(ref)
    let entries = allEntriesFeed.entries

    log('Generating activity')
    const activities = await generateActivity(ref, entries)

    log('Caching activity')
    await cacheActivity(ref, activities)

    log('Trigger mutate')
    await ref.current.feeds.activity.response.mutate()
    ref.current.feeds.activity.setLoadingState()

    log('Returning')
    return {
      updatedAt: new Date().getTime(),
      entries: activities,
    }
  } catch (e) {
    log('Error', e)
  } finally {
    ref.current.feeds.activity.setLoadingState()
  }
}

function generateActivity(ref: ControlRef, entries: Entry[]): Activity[] {
  const myUserId = ref.current.userId

  const stats = entries.reduce(
    (acc, entry) => {
      const userId = entry.userId

      if (userId === myUserId) {
        return acc
      }

      const record = acc[userId] || {
        userId,
        buckets: {
          hour: {
            count: 0,
            entries: [],
          },
          day: {
            count: 0,
            entries: [],
          },
          week: {
            count: 0,
            entries: [],
          },
          month: {
            count: 0,
            entries: [],
          },
          year: {
            count: 0,
            entries: [],
          },
        },
      }
      const bucketKey = getBucket(entry.post.ts)
      if (bucketKey) {
        const bucket = record.buckets[bucketKey]

        return {
          ...acc,
          [userId]: {
            ...record,
            buckets: {
              ...record.buckets,
              [bucketKey]: {
                count: bucket.count + 1,
                entries: bucket.entries.concat([entry]),
              },
            },
          },
        }
      }
      return acc
    },
    {} as {
      [userId: string]: {
        userId: string
        buckets: {
          [bucketKey: string]: {
            count: number
            entries: Entry[]
          }
        }
      }
    }
  )

  const userStats = Object.entries(stats)

  let allActivities = []

  // Post summaries
  userStats.forEach(([_key, record]) => {
    const { userId, buckets } = record

    const bucketKey = bucketKeys.find((key) => {
      const bucket = buckets[key]
      const entries = getPlainEntries(bucket.entries)
      return !!entries.length
    })
    const bucket = buckets[bucketKey]
    if (!bucket) {
      return
    }
    const entries = getPlainEntries(bucket.entries)
    const count = entries.length

    let message = ''
    if (bucketKey === 'hour') {
      message = `has recently posted`
    } else {
      message = `has posted ${count} ${
        count > 1 ? 'times' : 'time'
      } in the last ${bucketKey}`
    }

    const activityItem = {
      id: `${userId}/counts`,
      userId,
      message,
      bucketKey,
      at: new Date().getTime(),
    }

    allActivities.push(activityItem)
  })

  // SkyTransfer summaries
  userStats.forEach(([_key, record]) => {
    const { userId, buckets } = record
    const bucketKey = bucketKeys.find((key) => {
      const bucket = buckets[key]
      const entries = getSkyTransferEntries(bucket.entries)
      return !!entries.length
    })
    const bucket = buckets[bucketKey]
    if (!bucket) {
      return
    }
    const entries = getSkyTransferEntries(bucket.entries)
    const count = entries.length

    const activity = {
      id: `${userId}/skytransfer`,
      userId,
      message: `has published ${count} ${
        count > 1 ? 'files' : 'file'
      } on SkyTransfer in the last ${bucketKey}`,
      bucketKey,
      at: new Date().getTime(),
    }
    allActivities.push(activity)
  })

  // Chess summaries
  userStats.forEach(([_key, record]) => {
    const { userId, buckets } = record
    const bucketKey = bucketKeys.find((key) => {
      const bucket = buckets[key]
      const entries = getChessEntries(bucket.entries)
      return !!entries.length
    })
    const bucket = buckets[bucketKey]
    if (!bucket) {
      return
    }
    const entries = getChessEntries(bucket.entries)

    if (entries.length) {
      const results = entries.reduce(
        (acc, entry) => {
          if (
            entry.post.content.ext.skychess.endState.winnerUserId === userId
          ) {
            return {
              ...acc,
              wins: acc.wins + 1,
            }
          } else {
            return {
              ...acc,
              losses: acc.losses + 1,
            }
          }
        },
        {
          wins: 0,
          losses: 0,
        }
      )

      const activity = {
        id: `${userId}/chess`,
        userId,
        message: `has won ${results.wins} and lost ${results.losses} chess match in the last ${bucketKey}`,
        bucketKey,
        at: new Date().getTime(),
      }
      allActivities.push(activity)
    }
  })

  return allActivities
}

const second = 1000
const minute = second * 60
const hour = minute * 60
const day = hour * 24
const week = day * 7
const month = day * 30
const year = day * 365
type BucketKey = 'hour' | 'day' | 'week' | 'month' | 'year'
const bucketKeys: BucketKey[] = ['hour', 'day', 'week', 'month', 'year']

function getBucket(ts: number): BucketKey | undefined {
  const now = new Date().getTime()
  const diff = now - ts

  if (diff < hour) {
    return 'hour'
  }
  if (diff < day) {
    return 'day'
  }
  if (diff < week) {
    return 'week'
  }
  if (diff < month) {
    return 'month'
  }
  if (diff < year) {
    return 'year'
  }
  return undefined
}

function checkIsChessEntry(entry: Entry) {
  return entry.post.content.ext?.skychess
}

function checkIsSkyTransferEntry(entry: Entry) {
  return entry.post.content.link?.includes('skytransfer.hns')
}

function getPlainEntries(entries: Entry[]) {
  return entries.filter(
    (entry) => !checkIsChessEntry(entry) && !checkIsSkyTransferEntry(entry)
  )
}

function getChessEntries(entries: Entry[]) {
  return entries.filter(checkIsChessEntry)
}

function getSkyTransferEntries(entries: Entry[]) {
  return entries.filter(checkIsSkyTransferEntry)
}
