import { createLogger } from '../../shared/logger'
import { ControlRef } from '../skynet/useControlRef'
import { scoreEntries } from './scoring'
import {
  cacheTopEntries,
  fetchAllEntries,
  fetchTopEntries,
  needsRefresh,
} from './shared'
import { EntryFeed, WorkerParams } from './types'

export async function workerFeedTopUpdate(
  ref: ControlRef,
  params: WorkerParams = {}
): Promise<EntryFeed> {
  const log = createLogger('feed/top/update')

  const { force = false } = params
  log('Running')
  ref.current.feeds.top.setLoadingState('Checking feed status')

  if (!force) {
    log('Fetching cached top entries')
    let feed = await fetchTopEntries(ref)

    if (!needsRefresh(feed, 5)) {
      log('Up to date')
      ref.current.feeds.top.setLoadingState()
      return
    }
  }
  ref.current.feeds.top.setLoadingState('Compiling')

  log('Fetching cached entries')
  let allEntriesFeed = await fetchAllEntries(ref)
  let entries = allEntriesFeed.entries

  log('Scoring entries')
  ref.current.feeds.top.setLoadingState('Scoring')
  const keywords = ref.current.keywords
  const domains = ref.current.domains
  const scoredEntries = await scoreEntries(entries, {
    keywords,
    domains,
  })
  const sortedEntries = scoredEntries.sort((a, b) =>
    a.score < b.score ? 1 : -1
  )

  log('Caching top entries')
  await cacheTopEntries(ref, sortedEntries)

  log('Trigger mutate')
  await ref.current.feeds.top.response.mutate()
  ref.current.feeds.top.setLoadingState()

  log('Returning')
  return {
    updatedAt: new Date().getTime(),
    entries: sortedEntries,
  }
}
