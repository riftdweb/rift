import { globals } from '../../shared/globals'
import { logger } from '../../shared/logger'
import { scoreEntries } from './scoring'
import {
  cacheTopEntries,
  fetchAllEntries,
  fetchTopEntries,
  needsRefresh,
} from './shared'
import { EntryFeed } from './types'

function log(...args) {
  logger('workerFeed', ...args)
}

type Params = {
  force?: boolean
  callback?: () => void
}

export async function workerFeed(params: Params = {}): Promise<EntryFeed> {
  const { force = false } = params
  log('Feed worker running')

  if (!force) {
    log('Fetching cached top entries')
    let feed = await fetchTopEntries()

    if (!needsRefresh(feed, 5)) {
      log('Up to date')
      return
    }
  }

  log('Fetching cached entries')
  let allEntriesFeed = await fetchAllEntries()
  let entries = allEntriesFeed.entries

  log('Scoring entries')
  const keywords = globals.keywords
  const domains = globals.domains
  const scoredEntries = await scoreEntries(entries, {
    keywords,
    domains,
  })
  const sortedEntries = scoredEntries.sort((a, b) =>
    a.score < b.score ? 1 : -1
  )

  log(sortedEntries)
  log('Caching top entries')
  await cacheTopEntries(sortedEntries)

  log('Feed worker returning')
  return {
    updatedAt: new Date().getTime(),
    entries: sortedEntries,
  }
}
