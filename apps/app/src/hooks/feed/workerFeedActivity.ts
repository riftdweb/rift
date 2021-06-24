import { createLogger } from '../../shared/logger'
import { ControlRef } from '../skynet/useControlRef'
import {
  cacheActivity,
  fetchActivity,
  fetchAllEntries,
  needsRefresh,
} from './shared'
import { Activity, ActivityFeed, Entry, WorkerParams } from './types'

export async function workerFeedActivityUpdate(
  ref: ControlRef,
  params: WorkerParams = {}
): Promise<ActivityFeed> {
  const log = createLogger('feed/activity/update')

  const { force = false } = params

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
  const activities = await generateActivity(entries)

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
}

function generateActivity(entries: Entry[]): Activity[] {
  const stats = entries.reduce(
    (acc, entry) => {
      const userId = entry.userId
      const record = acc[userId] || {
        userId,
        count: 0,
        entries: [],
      }
      return {
        ...acc,
        [userId]: {
          userId,
          count: record.count + 1,
          entries: record.entries.concat([entry]),
        },
      }
    },
    {} as {
      [userId: string]: {
        userId: string
        count: number
        entries: Entry[]
      }
    }
  )

  // log(stats)
  const userStats = Object.entries(stats)

  const activities = userStats.reduce(
    (acc, [_key, { userId, count, entries }]) => {
      let activities = []
      const countActivity = {
        id: userId,
        userId,
        message: `has posted ${count} times in the last day`,
        at: new Date().getTime(),
      }
      activities.push(countActivity)

      const chessEntries = entries.filter(
        (entry) => entry.post.content.ext?.skychess
      )
      if (chessEntries.length) {
        const results = chessEntries.reduce(
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

        const chessActivity = {
          id: 'chess/' + userId,
          userId,
          message: `has won ${results.wins} and lost ${results.losses} chess match in the last day`,
          at: new Date().getTime(),
        }
        activities.push(chessActivity)
      }
      return acc.concat(activities)
    },
    []
  )

  return activities
}
