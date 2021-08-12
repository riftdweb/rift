import * as CAF from 'caf'
import { JSONResponse } from 'skynet-js'
import { createLogger } from '../shared/logger'
import { ControlRef } from '../contexts/skynet/ref'
import { scoreEntries } from './scoring'
import {
  cacheTopEntries,
  fetchAllEntries,
  fetchTopEntries,
  needsRefresh,
} from './workerApi'
import { clearToken, handleToken } from './tokens'
import { v4 as uuid } from 'uuid'
import { Entry, EntryFeed, WorkerParams } from '@riftdweb/types'

const cafWorkerFeedTopUpdate = CAF(function* (
  signal: any,
  ref: ControlRef,
  params: WorkerParams
): Generator<Promise<EntryFeed | Entry[] | JSONResponse | void>, any, any> {
  const log = createLogger('feed/top/update', {
    workflowId: params.workflowId,
  })

  try {
    const { force = false } = params
    log('Running')
    ref.current.feeds.top.setLoadingState('Checking feed status')

    if (!force) {
      log('Fetching cached top entries')
      let feed = yield fetchTopEntries(ref)

      if (!needsRefresh(feed, 5)) {
        log('Up to date')
        ref.current.feeds.top.setLoadingState()
        return
      }
    }
    ref.current.feeds.top.setLoadingState('Compiling')

    log('Fetching cached entries')
    let allEntriesFeed: EntryFeed = yield fetchAllEntries(ref)
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
    yield cacheTopEntries(ref, sortedEntries)

    log('Trigger mutate')
    yield ref.current.feeds.top.response.mutate()
    ref.current.feeds.top.setLoadingState()

    log('Returning')
  } finally {
    log('Finally')
    if (signal.aborted) {
      log('Aborted')
    }
    clearToken(ref, 'feedTopUpdate')
    ref.current.feeds.top.setLoadingState()
  }
})

// Computes a new top feed
// "Latest" - Subsequent calls to this worker will cancel previous runs.
export async function workerFeedTopUpdate(
  ref: ControlRef,
  params: WorkerParams = {}
): Promise<void> {
  const workflowId = uuid()
  const log = createLogger('feed/top/update', {
    workflowId,
  })
  log('handling things before new run')
  const token = await handleToken(ref, 'feedTopUpdate')
  log('starting new run')
  try {
    await cafWorkerFeedTopUpdate(token.signal, ref, {
      ...params,
      workflowId,
    })
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  }
}
