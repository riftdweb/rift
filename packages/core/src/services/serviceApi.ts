import {
  Feed,
  Entry,
  EntryFeed,
  ActivityFeed,
  Activity,
  UsersMap,
} from '@riftdweb/types'
import { getDataKeyFeeds, getDataKeyUsers } from '../shared/dataKeys'
import { feedDAC } from '../contexts/skynet'
import { ControlRef } from '../contexts/skynet/ref'
import { apiLimiter } from '../contexts/skynet/api'

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

type Params = {
  priority?: number
}

const defaultParams = {
  priority: 0,
}

export async function cacheUserEntries(
  ref: ControlRef,
  userId: string,
  entries: Entry[],
  params: Params = defaultParams
): Promise<void> {
  const { Api } = ref.current
  await Api.setJSON({
    path: getDataKeyFeeds(`entries/${userId}`),
    json: {
      updatedAt: new Date().getTime(),
      entries: entries,
    } as EntryFeed,
    priority: params.priority,
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

export async function fetchAllEntries(
  ref: ControlRef,
  params: Params = defaultParams
): Promise<EntryFeed> {
  const { Api } = ref.current
  let { data: feed } = await Api.getJSON<EntryFeed>({
    path: getDataKeyFeeds('entries'),
    priority: params.priority,
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
  userId: string,
  params: Params = defaultParams
): Promise<EntryFeed> {
  const { Api } = ref.current
  let { data: feed } = await Api.getJSON<EntryFeed>({
    path: getDataKeyFeeds(`entries/${userId}`),
    priority: params.priority,
  })
  return feed || emptyFeed
}

export async function fetchTopEntries(
  ref: ControlRef,
  params: Params = defaultParams
): Promise<EntryFeed> {
  const Api = ref.current.Api
  let { data: feed } = await Api.getJSON<EntryFeed>({
    path: getDataKeyFeeds('entries/top'),
    priority: params.priority,
  })
  return feed || emptyFeed
}

export async function fetchActivity(
  ref: ControlRef,
  params: Params = defaultParams
): Promise<ActivityFeed> {
  const { Api } = ref.current
  let { data: feed } = await Api.getJSON<ActivityFeed>({
    path: getDataKeyFeeds('activity'),
    priority: params.priority,
  })
  return feed || emptyActivityFeed
}

export async function cacheAllEntries(
  ref: ControlRef,
  entries: Entry[],
  params: Params = defaultParams
) {
  const { Api } = ref.current
  return await Api.setJSON({
    path: getDataKeyFeeds('entries'),
    json: {
      updatedAt: new Date().getTime(),
      entries: entries,
    } as EntryFeed,
    priority: params.priority,
  })
}

export async function compileUserEntries(
  userId: string,
  params: Params = defaultParams
): Promise<Entry[]> {
  let allUserEntries: Entry[] = []
  try {
    const task = async () => {
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
    }
    await apiLimiter.add(task, {
      cost: 5,
      priority: params.priority,
      meta: {
        id: userId,
        name: 'feed',
        operation: 'compile',
      },
    })
  } catch (e) {
    console.log('Error in compileUserEntries', e)
    return allUserEntries
  }
  return allUserEntries
}

export async function cacheTopEntries(
  ref: ControlRef,
  entries: Entry[],
  params: Params = defaultParams
): Promise<void> {
  const { Api } = ref.current
  await Api.setJSON({
    path: getDataKeyFeeds('entries/top'),
    json: {
      updatedAt: new Date().getTime(),
      entries: entries.slice(0, 100),
    } as EntryFeed,
    priority: params.priority,
  })
}

export async function cacheActivity(
  ref: ControlRef,
  activities: Activity[],
  params: Params = defaultParams
): Promise<void> {
  const { Api } = ref.current
  await Api.setJSON({
    path: getDataKeyFeeds('activity'),
    json: {
      updatedAt: new Date().getTime(),
      entries: activities,
    } as ActivityFeed,
    priority: params.priority,
  })
}

export async function fetchUsersMap(
  ref: ControlRef,
  params: Params = defaultParams
): Promise<UsersMap> {
  const response = await ref.current.Api.getJSON<UsersMap>({
    path: getDataKeyUsers('usersMap'),
    priority: params.priority,
  })
  return response.data && response.data.entries
    ? response.data
    : {
        entries: {},
        updatedAt: 0,
      }
}

export async function cacheUsersMap(
  ref: ControlRef,
  usersMap: UsersMap,
  params: Params = defaultParams
): Promise<void> {
  const { Api } = ref.current
  await Api.setJSON({
    path: getDataKeyUsers('usersMap'),
    json: usersMap,
    priority: params.priority,
  })
}

export function needsRefresh<T>(feed: Feed<T>, minutes: number = 0.5) {
  if (feed && feed.updatedAt > new Date().getTime() - 1000 * 60 * minutes) {
    return false
  }
  return true
}
