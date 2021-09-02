import * as CAF from 'caf'
import { JSONResponse } from 'skynet-js'
import { createLogger } from '@riftdweb/logger'
import { Activity, ActivityFeed, EntryFeed, TaskParams } from '@riftdweb/types'
import { v4 as uuid } from 'uuid'
import { wait } from '../../shared/wait'
import { ControlRef } from '../../contexts/skynet/ref'
import {
  cacheActivity,
  fetchActivity,
  fetchAllEntries,
  needsRefresh,
} from '../serviceApi'
import { clearToken, handleToken } from '../tokens'
import { generateActivity } from './generate'

const tokenName = 'feedActivityUpdate'
const logName = 'feed/activity/update'

const cafUpdateActivity = CAF(function* (
  signal: any,
  ref: ControlRef,
  params: TaskParams
): Generator<
  Promise<ActivityFeed | EntryFeed | JSONResponse | void> | Activity[],
  any,
  any
> {
  const { force = false, delay = 0 } = params
  const log = createLogger(logName, {
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
      let feed: ActivityFeed = yield fetchActivity(ref, {
        priority: params.priority,
      })

      if (!needsRefresh(feed, 5)) {
        log('Up to date')
        ref.current.feeds.activity.setLoadingState()
        return
      }
    }

    log('Fetching cached entries')
    let allEntriesFeed: EntryFeed = yield fetchAllEntries(ref, {
      priority: params.priority,
    })
    let entries = allEntriesFeed.entries

    log('Generating activity')
    const activities = generateActivity(ref, entries)

    log('Caching activity')
    yield cacheActivity(ref, activities, {
      priority: params.priority,
    })

    log('Trigger mutate')
    yield ref.current.feeds.activity.response.mutate()
    ref.current.feeds.activity.setLoadingState()
  } finally {
    if (signal.aborted) {
      log('Aborted')
    }
    clearToken(ref, tokenName)
    ref.current.feeds.activity.setLoadingState()
    log('Finished')
  }
})

// Computes a new activity feed
// "Latest" - Subsequent calls to this task will cancel previous runs.
export async function updateActivityFeed(
  ref: ControlRef,
  params: TaskParams = {}
): Promise<void> {
  const workflowId = uuid()
  const log = createLogger(logName, {
    workflowId,
  })
  const token = await handleToken(ref, tokenName)
  try {
    await cafUpdateActivity(token.signal, ref, {
      ...params,
      workflowId,
    })
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  }
}
