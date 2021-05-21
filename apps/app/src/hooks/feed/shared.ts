import { globals } from '../../shared/globals'
import { feedDAC } from '../skynet'
import { Feed, Entry, EntryFeed } from './types'

export const emptyFeed: EntryFeed = {
  updatedAt: 0,
  entries: [],
}

export async function cacheUserEntries(userId: string, entries: Entry[]) {
  const Api = globals.Api
  return await Api.setJSON({
    dataKey: `entries/${userId}`,
    json: {
      updatedAt: new Date().getTime(),
      entries: entries,
    } as EntryFeed,
  })
}

export function upsertAllEntries(
  allEntries: Entry[],
  entries: Entry[]
): Entry[] {
  // TODO: upsert on unique ID
  return entries.reduce<Entry[]>((acc, entry) => {
    const i = acc.findIndex((e) => e.id === entry.id)
    if (~i) {
      acc[i] = entry
      return acc
    } else {
      return acc.concat(entry)
    }
  }, allEntries)
}

export async function fetchAllEntries(): Promise<EntryFeed> {
  const Api = globals.Api
  let { data: feed } = await Api.getJSON({
    dataKey: 'entries',
  })
  return feed
    ? {
        updatedAt: feed.updatedAt || 0,
        entries: feed.entries
          ? feed.entries.sort((a, b) => (a.post.ts < b.post.ts ? 1 : -1))
          : [],
      }
    : emptyFeed
}

export async function fetchUserEntries(userId: string): Promise<EntryFeed> {
  const Api = globals.Api
  let { data: feed } = await Api.getJSON({
    dataKey: `entries/${userId}`,
  })
  return feed || emptyFeed
}

export async function fetchTopEntries(): Promise<EntryFeed> {
  const Api = globals.Api
  let { data: feed } = await Api.getJSON({
    dataKey: 'entries/top',
  })
  return feed || emptyFeed
}

export async function cacheAllEntries(entries: Entry[]) {
  const Api = globals.Api
  return await Api.setJSON({
    dataKey: 'entries',
    json: {
      updatedAt: new Date().getTime(),
      entries: entries,
    } as EntryFeed,
  })
}

export async function compileUserEntries(userId: string): Promise<Entry[]> {
  let allUserEntries: Entry[] = []
  for await (let batchOfUserEntries of feedDAC.loadPostsForUser(userId)) {
    allUserEntries = allUserEntries.concat(
      batchOfUserEntries.map((post) => ({
        // TODO: Move to fetching manually, because these ids are not unique
        id: `${userId}/posts/${post.id}`,
        userId: userId,
        post,
      }))
    )
  }
  return allUserEntries
}

export async function cacheTopEntries(entries: Entry[]) {
  const Api = globals.Api
  return await Api.setJSON({
    dataKey: 'entries/top',
    json: {
      updatedAt: new Date().getTime(),
      entries: entries.slice(0, 100),
    } as EntryFeed,
  })
}

export function needsRefresh<T>(feed: Feed<T>, minutes: number = 0.5) {
  if (feed && feed.updatedAt > new Date().getTime() - 1000 * 60 * minutes) {
    return false
  }
  return true
}
