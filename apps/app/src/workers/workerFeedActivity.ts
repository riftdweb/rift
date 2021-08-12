import * as CAF from 'caf'
import { JSONResponse } from 'skynet-js'
import { createLogger } from '../shared/logger'
import { wait } from '../shared/wait'
import { v4 as uuid } from 'uuid'
import { ControlRef } from '../contexts/skynet/ref'
import {
  cacheActivity,
  fetchActivity,
  fetchAllEntries,
  needsRefresh,
} from './workerApi'
import { clearToken, handleToken } from './tokens'
import {
  Activity,
  ActivityFeed,
  Entry,
  EntryFeed,
  WorkerParams,
} from '@riftdweb/types'

const cafWorkerFeedActivityUpdate = CAF(function* (
  signal: any,
  ref: ControlRef,
  params: WorkerParams
): Generator<
  Promise<ActivityFeed | EntryFeed | JSONResponse | void> | Activity[],
  any,
  any
> {
  const { force = false, delay = 0 } = params
  const log = createLogger('feed/activity/update', {
    workflowId: params.workflowId,
  })
  try {
    log('Running')
    if (delay) {
      yield wait(delay)
    }
    ref.current.feeds.activity.setLoadingState('Compiling')

    if (!force) {
      log('Fetching cached activity')
      let feed: ActivityFeed = yield fetchActivity(ref)

      if (!needsRefresh(feed, 5)) {
        log('Up to date')
        ref.current.feeds.activity.setLoadingState()
        return
      }
    }

    log('Fetching cached entries')
    let allEntriesFeed: EntryFeed = yield fetchAllEntries(ref)
    let entries = allEntriesFeed.entries

    log('Generating activity')
    const activities = generateActivity(ref, entries)

    log('Caching activity')
    yield cacheActivity(ref, activities)

    log('Trigger mutate')
    yield ref.current.feeds.activity.response.mutate()
    ref.current.feeds.activity.setLoadingState()

    log('Returning')
  } finally {
    log('Finally')
    if (signal.aborted) {
      log('Aborted')
    }
    clearToken(ref, 'feedActivityUpdate')
    ref.current.feeds.activity.setLoadingState()
  }
})

// Computes a new activity feed
// "Latest" - Subsequent calls to this worker will cancel previous runs.
export async function workerFeedActivityUpdate(
  ref: ControlRef,
  params: WorkerParams = {}
): Promise<void> {
  const workflowId = uuid()
  const log = createLogger('feed/activity/update', {
    workflowId,
  })
  const token = await handleToken(ref, 'feedActivityUpdate')
  try {
    await cafWorkerFeedActivityUpdate(token.signal, ref, {
      ...params,
      workflowId,
    })
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  }
}

function generateActivity(ref: ControlRef, entries: Entry[]): Activity[] {
  const myUserId = ref.current.myUserId

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
