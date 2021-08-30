import * as CAF from 'caf'
import { JSONResponse } from 'skynet-js'
import { createLogger } from '../../shared/logger'
import { ControlRef } from '../../contexts/skynet/ref'
import { scoreEntries } from './scoring'
import {
  cacheTopEntries,
  fetchAllEntries,
  fetchTopEntries,
  needsRefresh,
} from '../workerApi'
import { clearToken, handleToken } from '../tokens'
import { v4 as uuid } from 'uuid'
import { Entry, EntryFeed, WorkerParams } from '@riftdweb/types'

const tokenName = 'feedTopUpdate'
const logName = 'feed/top/update'

const cafUpdateTopFeed = CAF(function* (
  signal: any,
  ref: ControlRef,
  params: WorkerParams
): Generator<Promise<EntryFeed | Entry[] | JSONResponse | void>, any, any> {
  const log = createLogger(logName, {
    workflowId: params.workflowId,
  })

  try {
    const { force = false } = params
    log('Running')
    ref.current.feeds.top.setLoadingState('Checking feed status')

    if (!force) {
      log('Fetching cached top entries')
      let feed = yield fetchTopEntries(ref, {
        priority: params.priority,
      })

      if (!needsRefresh(feed, 5)) {
        log('Up to date')
        ref.current.feeds.top.setLoadingState()
        return
      }
    }
    ref.current.feeds.top.setLoadingState('Compiling')

    log('Fetching cached entries')
    let allEntriesFeed: EntryFeed = yield fetchAllEntries(ref, {
      priority: params.priority,
    })
    let entries = allEntriesFeed.entries

    log('Scoring entries')
    ref.current.feeds.top.setLoadingState('Scoring')
    const keywords = ref.current.keywords
    const domains = ref.current.domains
    const scoredEntries: Entry[] = yield scoreEntries(entries, {
      keywords,
      domains,
    })
    const sortedEntries = scoredEntries.sort((a, b) =>
      a.score < b.score ? 1 : -1
    )

    log('Caching top entries')
    yield cacheTopEntries(ref, sortedEntries, {
      priority: params.priority,
    })

    log('Trigger mutate')
    yield ref.current.feeds.top.response.mutate()
    ref.current.feeds.top.setLoadingState()
  } finally {
    if (signal.aborted) {
      log('Aborted')
    }
    clearToken(ref, tokenName)
    ref.current.feeds.top.setLoadingState()
    log('Finished')
  }
})

// Computes a new top feed
// "Latest" - Subsequent calls to this worker will cancel previous runs.
export async function updateTopFeed(
  ref: ControlRef,
  params: WorkerParams = {}
): Promise<void> {
  const workflowId = uuid()
  const log = createLogger(logName, {
    workflowId,
  })
  const token = await handleToken(ref, tokenName)
  try {
    await cafUpdateTopFeed(token.signal, ref, {
      ...params,
      workflowId,
    })
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  }
}
