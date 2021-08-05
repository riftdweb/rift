import { getDataKeyFeeds } from '../shared/dataKeys'
import { feedDAC } from '../contexts/skynet'
import { ControlRef } from '../contexts/skynet/useControlRef'
import {
  Feed,
  Entry,
  EntryFeed,
  ActivityFeed,
  Activity,
  UserItem,
} from '@riftdweb/types'

export const emptyFeed: EntryFeed = {
  updatedAt: 0,
  entries: [],
  null: true,
}

export const emptyActivityFeed: ActivityFeed = {
  updatedAt: 0,
  entries: [],
  null: true,
}

export async function cacheUserEntries(
  ref: ControlRef,
  userId: string,
  entries: Entry[]
): Promise<void> {
  const { Api } = ref.current
  await Api.setJSON({
    path: getDataKeyFeeds(`entries/${userId}`),
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

export async function fetchAllEntries(ref: ControlRef): Promise<EntryFeed> {
  const { Api } = ref.current
  let { data: feed } = await Api.getJSON<EntryFeed>({
    path: getDataKeyFeeds('entries'),
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

export async function fetchUserEntries(
  ref: ControlRef,
  userId: string
): Promise<EntryFeed> {
  const { Api } = ref.current
  let { data: feed } = await Api.getJSON<EntryFeed>({
    path: getDataKeyFeeds(`entries/${userId}`),
  })
  return feed || emptyFeed
}

export async function fetchTopEntries(ref: ControlRef): Promise<EntryFeed> {
  const Api = ref.current.Api
  let { data: feed } = await Api.getJSON<EntryFeed>({
    path: getDataKeyFeeds('entries/top'),
  })
  return feed || emptyFeed
}

export async function fetchActivity(ref: ControlRef): Promise<ActivityFeed> {
  const { Api } = ref.current
  let { data: feed } = await Api.getJSON<ActivityFeed>({
    path: getDataKeyFeeds('activity'),
  })
  return feed || emptyActivityFeed
}

export async function cacheAllEntries(ref: ControlRef, entries: Entry[]) {
  const { Api } = ref.current
  return await Api.setJSON({
    path: getDataKeyFeeds('entries'),
    json: {
      updatedAt: new Date().getTime(),
      entries: entries,
    } as EntryFeed,
  })
}

export async function compileUserEntries(userId: string): Promise<Entry[]> {
  let allUserEntries: Entry[] = []
  try {
    for await (let batchOfUserEntries of feedDAC.loadPostsForUser(userId)) {
      allUserEntries = allUserEntries.concat(
        batchOfUserEntries.map((post) => ({
          // TODO: Move to fetching manually, because these ids are not unique
          // Added timestamp to the end since posts from different skapps can have same ID
          id: `${userId}/posts/${post.id}/${post.ts}`,
          userId: userId,
          post,
        }))
      )
    }
  } catch (e) {
    console.log(e)
    return allUserEntries
  }
  return allUserEntries
}

export async function cacheTopEntries(
  ref: ControlRef,
  entries: Entry[]
): Promise<void> {
  const { Api } = ref.current
  await Api.setJSON({
    path: getDataKeyFeeds('entries/top'),
    json: {
      updatedAt: new Date().getTime(),
      entries: entries.slice(0, 100),
    } as EntryFeed,
  })
}

export async function cacheActivity(
  ref: ControlRef,
  activities: Activity[]
): Promise<void> {
  const { Api } = ref.current
  await Api.setJSON({
    path: getDataKeyFeeds('activity'),
    json: {
      updatedAt: new Date().getTime(),
      entries: activities,
    } as ActivityFeed,
  })
}

export function needsRefresh<T>(feed: Feed<T>, minutes: number = 0.5) {
  if (feed && feed.updatedAt > new Date().getTime() - 1000 * 60 * minutes) {
    return false
  }
  return true
}

export async function fetchUsersIndex(
  ref: ControlRef
): Promise<Feed<UserItem>> {
  const response = await ref.current.Api.getJSON<Feed<UserItem>>({
    path: 'v0/usersIndex',
  })

  return (
    response.data || {
      updatedAt: 0,
      entries: [],
    }
  )
}

export async function cacheUsersIndex(
  ref: ControlRef,
  userItems: UserItem[]
): Promise<void> {
  const { Api } = ref.current
  await Api.setJSON({
    path: 'v0/usersIndex',
    json: {
      updatedAt: new Date().getTime(),
      entries: userItems,
    },
  })
}
