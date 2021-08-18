import {
  IProfileIndex,
  IUserProfile,
} from '@skynethub/userprofile-library/dist/types'
import { createLogger } from '../shared/logger'
import { socialDAC } from '../contexts/skynet'
import { ControlRef } from '../contexts/skynet/ref'
import uniq from 'lodash/uniq'
import { IUser, WorkerParams } from '@riftdweb/types'
import { isUpToDate, isUserUpToDate } from '../contexts/users'
import { apiLimiter } from '../contexts/skynet/api'
import { waitFor } from '../shared/wait'
import { workerFeedUserUpdate } from './workerFeedUser'
import { TaskQueue } from '../shared/taskQueue'

type FetchUserParams = {
  // Used for a batch workflow that would like to gather latest user data
  // (other workflows such as the UI prefer current + schedule async update)
  isBatched?: boolean
  fullFetch?: boolean
  priority?: number
  force?: boolean
  workflowId?: string
}

async function updateUserData(
  ref: ControlRef,
  user: IUser,
  params: FetchUserParams = {}
): Promise<IUser> {
  const { userId } = user
  const log = createLogger(`users/${userId.slice(0, 5)}/data`, {
    workflowId: params.workflowId,
  })

  const { priority = 0, force = false, fullFetch = false } = params
  let didSetFeedLoading = false
  let didStartFeedUpdate = false

  try {
    let updatedUser = {
      ...user,
      updatedAt: new Date().getTime(),
    }

    const shouldUpdateFeed = fullFetch && (force || !isUpToDate(user, 'feed'))

    // Set the feed loading flag before other blocking jobs
    if (shouldUpdateFeed) {
      log('Setting feed updating status')
      ref.current.feeds.user.setLoadingState(userId, 'Updating feed')
      didSetFeedLoading = true
    }

    if (force || !isUpToDate(user, 'profile')) {
      log('Updating profile')
      const profile = await fetchProfile(ref, user, {
        priority,
      })

      updatedUser = {
        ...updatedUser,
        username: profile.username,
        profile: {
          updatedAt: new Date().getTime(),
          data: profile,
        },
        updatedAt: new Date().getTime(),
      }
    }

    if (force || !isUpToDate(user, 'following')) {
      log('Updating following')
      const followingIds = await fetchFollowing(ref, user, {
        priority,
      })
      const skapps = await fetchMeta(ref, user, {
        priority,
      })

      updatedUser = {
        ...updatedUser,
        following: {
          updatedAt: new Date().getTime(),
          data: followingIds,
        },
        meta: {
          updatedAt: new Date().getTime(),
          data: {
            skapps,
          },
        },
        updatedAt: new Date().getTime(),
      }
    }

    // TODO: add comment explaining why this is necessary
    if (shouldUpdateFeed) {
      updatedUser = {
        ...updatedUser,
        feed: {
          ...updatedUser.feed,
          updatedAt: new Date().getTime(),
        },
      }
    }

    // Upsert before feed update, so user exists
    ref.current.upsertUser(updatedUser)

    // Async
    if (shouldUpdateFeed) {
      log('Updating feed')
      workerFeedUserUpdate(ref, userId, {
        priority: params.priority,
      })
      didStartFeedUpdate = true
    }

    log('Done')
    return updatedUser
  } finally {
    // If this worker set the loading state but never started the update
    if (didSetFeedLoading && !didStartFeedUpdate) {
      ref.current.feeds.user.setLoadingState(userId, '')
    }
  }
}

async function maybeFetchUserFromCache(
  ref: ControlRef,
  userId: string,
  params: FetchUserParams = {}
): Promise<IUser> {
  const { force = false } = params
  const log = createLogger(`users/${userId.slice(0, 5)}/data`, {
    workflowId: params.workflowId,
    // disable: true,
  })

  // Ensure main collection has loaded
  await waitFor(() => [ref.current, ref.current.usersMap.data], {
    log,
  })

  const existingUser = ref.current.getUser(userId)

  if (
    !force &&
    isUserUpToDate(existingUser, {
      include: params.fullFetch
        ? ['profile', 'following', 'feed']
        : ['profile', 'following'],
      verbose: true,
      log,
    })
  ) {
    return existingUser
  }

  return undefined
}

async function fetchAndUpdateUser(
  ref: ControlRef,
  userId: string,
  params: FetchUserParams = {}
): Promise<IUser> {
  const { isBatched = false, force = false } = params

  const existingUser = ref.current.getUser(userId)
  const user = existingUser || buildUser(userId)

  if (isBatched) {
    const updatedUser = await updateUserData(ref, user, params)
    return updatedUser
  } else {
    updateUserData(ref, user, params)
    return user
  }
}

export function fetchUserForIndexing(
  ref: ControlRef,
  userId: string,
  workflowId?: string
) {
  const key = `${userId}/indexing`
  return queueFetchAndUpdateUser(ref, userId, {
    priority: 0,
    fullFetch: true,
    isBatched: true,
    force: false,
    key,
    workflowId,
  })
}

export function fetchUserForRendering(
  ref: ControlRef,
  userId: string,
  workflowId?: string
) {
  const key = `${userId}/rendering`
  return queueFetchAndUpdateUser(ref, userId, {
    priority: 1,
    fullFetch: false,
    isBatched: false,
    force: false,
    key,
    workflowId,
  })
}

export function fetchUserForInteraction(ref: ControlRef, userId: string) {
  const key = `${userId}/interaction`
  return queueFetchAndUpdateUser(ref, userId, {
    priority: 2,
    fullFetch: true,
    isBatched: false,
    force: false,
    key,
  })
}

export function fetchUserForInteractionSync(ref: ControlRef, userId: string) {
  const key = `${userId}/interaction`
  return queueFetchAndUpdateUser(ref, userId, {
    priority: 2,
    fullFetch: true,
    isBatched: true,
    force: false,
    key,
  })
}

export function fetchUserForInteractionAndForce(
  ref: ControlRef,
  userId: string
) {
  const key = `${userId}/interaction/force`
  return queueFetchAndUpdateUser(ref, userId, {
    priority: 2,
    fullFetch: true,
    isBatched: false,
    force: true,
    key,
  })
}

const taskQueue = TaskQueue('fetchAndUpdateUser', {
  poolSize: 5,
})

export async function queueFetchAndUpdateUser(
  ref: ControlRef,
  userId: string,
  params: FetchUserParams & {
    key: string
  }
): Promise<IUser> {
  const user = await maybeFetchUserFromCache(ref, userId, params)

  if (user) {
    return user
  }

  const task = () => fetchAndUpdateUser(ref, userId, params)

  return taskQueue.add(task, {
    name: `user/fetch: ${userId}`,
    priority: params.priority,
    key: params.key,
  })
}

async function fetchProfile(
  ref: ControlRef,
  user: IUser,
  params: WorkerParams = {}
): Promise<IUserProfile> {
  const { priority = 0 } = params
  const response = await ref.current.Api.getJSON<IProfileIndex>({
    publicKey: user.userId,
    domain: 'profile-dac.hns',
    path: 'profileIndex.json',
    discoverable: true,
    priority,
  })

  let profile = response.data?.profile || {
    version: 1,
    username: '',
  }

  return profile
}

async function fetchFollowing(
  ref: ControlRef,
  user: IUser,
  params: WorkerParams = {}
): Promise<string[]> {
  const { priority = 0 } = params
  const task = async () => {
    try {
      return socialDAC.getFollowingForUser(user.userId)
    } catch (e) {
      return []
    }
  }
  const _followingIds = await apiLimiter.add(task, {
    name: `fetch following: ${user.userId}`,
    cost: 5,
    priority,
  })
  const followingIds = uniq(_followingIds)

  return followingIds
}

type SkappsMap = Record<string, boolean>

async function fetchMeta(
  ref: ControlRef,
  user: IUser,
  params: WorkerParams = {}
): Promise<SkappsMap> {
  const { priority = 0 } = params
  const response = await ref.current.Api.getJSON<SkappsMap>({
    publicKey: user.userId,
    domain: 'feed-dac.hns',
    path: 'skapps.json',
    discoverable: true,
    priority,
  })

  let skapps = response.data || {}

  return skapps
}

function buildUser(userId: string): IUser {
  return {
    userId,
    relationship: {
      updatedAt: 0,
      data: 'none',
    },
    profile: {
      updatedAt: 0,
      data: {
        version: 1,
        username: '',
      },
    },
    following: {
      updatedAt: 0,
      data: [],
    },
    followers: {
      updatedAt: 0,
      data: [],
    },
    feed: {
      updatedAt: 0,
      data: {
        count: -1,
      },
    },
    meta: {
      updatedAt: 0,
      data: {
        skapps: {},
      },
    },
    updatedAt: new Date().getTime(),
  }
}
