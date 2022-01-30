import { IUser } from '@riftdweb/types'
import { isFollowing } from '../users/utils'
import { IAccount } from '../../stores/account'
import { getAccount } from '../account'
import { IUserDoc } from '../../stores/user'

export type Level = 'index' | 'render' | 'interact' | 'refresh' | 'read'
export type UserResourceKeys = 'profile' | 'following' | 'feed' | 'meta'

export type Config = {
  priority: number
  mode: 'async' | 'sync'
  timeouts: Record<UserResourceKeys, number>
}

// Priority
// 0 - Low priority indexing lane for discovered users that are not followed and not on screen
// 1 - Indexing lane for users that are followed but not on screen
// 2 - Rendering lane for users that appear on screen
// 3 - Priority indexing
// 4 - Interact lane for users that the user is specifically interacting with or has intentionally refreshed

const familiarLevelToConfig: Record<Level, Config> = {
  index: {
    priority: 0,
    mode: 'sync',
    timeouts: {
      profile: daysToMs(2),
      following: daysToMs(2),
      meta: daysToMs(7),
      // Ok to be low, because indexer prioritizes users and slowly queues.
      // Eventually need to make this much lower so very recent updates appear in feed.
      // TODO: revisit when integrating websockets.
      feed: hoursToMs(1),
    },
  },
  render: {
    priority: 2,
    mode: 'async',
    timeouts: {
      profile: daysToMs(2),
      following: daysToMs(2),
      meta: daysToMs(2),
      // -1 since indexer will eventually get to any user in render view and the indexer algo
      // itself can handle strategically trying to prioritize more important users.
      feed: -1,
    },
  },
  interact: {
    priority: 4,
    mode: 'async',
    timeouts: {
      profile: minutesToMs(2),
      following: minutesToMs(2),
      meta: minutesToMs(2),
      feed: minutesToMs(2),
    },
  },
  read: {
    priority: 4,
    mode: 'sync',
    timeouts: {
      profile: minutesToMs(2),
      following: minutesToMs(2),
      meta: -1,
      feed: -1,
    },
  },
  refresh: {
    priority: 4,
    mode: 'async',
    timeouts: {
      profile: 0,
      following: 0,
      meta: 0,
      feed: 0,
    },
  },
}

const unfamiliarLevelToConfig: Record<Level, Config> = {
  index: {
    priority: 0,
    mode: 'sync',
    timeouts: {
      profile: daysToMs(14),
      following: daysToMs(7),
      meta: daysToMs(14),
      feed: -1,
    },
  },
  render: {
    priority: 2,
    mode: 'async',
    timeouts: {
      profile: daysToMs(2),
      following: daysToMs(2),
      meta: daysToMs(2),
      feed: -1,
    },
  },
  interact: {
    priority: 4,
    mode: 'async',
    timeouts: {
      profile: minutesToMs(2),
      following: minutesToMs(2),
      meta: minutesToMs(2),
      feed: minutesToMs(2),
    },
  },
  read: {
    priority: 4,
    mode: 'sync',
    timeouts: {
      profile: minutesToMs(2),
      following: minutesToMs(2),
      meta: -1,
      feed: -1,
    },
  },
  refresh: {
    priority: 4,
    mode: 'async',
    timeouts: {
      profile: 0,
      following: 0,
      meta: 0,
      feed: 0,
    },
  },
}

export async function getConfig(user: IUserDoc, level: Level) {
  const account = await getAccount()
  const isSelf = account.myUserId === user.userId
  return isSelf || isFollowing(user)
    ? familiarLevelToConfig[level]
    : unfamiliarLevelToConfig[level]
}

export function getConfigSync(
  account: IAccount,
  user: IUserDoc | IUser,
  level: Level
) {
  const isSelf = account.myUserId === user.userId
  return isSelf || isFollowing(user)
    ? familiarLevelToConfig[level]
    : unfamiliarLevelToConfig[level]
}

function minutesToMs(minutes: number) {
  return 1000 * 60 * minutes
}

function hoursToMs(hours: number) {
  return 1000 * 60 * 60 * hours
}

function daysToMs(days: number) {
  return 1000 * 60 * 60 * 24 * days
}
