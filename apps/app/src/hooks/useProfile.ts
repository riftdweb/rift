import {
  IProfileIndex,
  IUserProfile,
} from '@skynethub/userprofile-library/dist/types'
import useSWR from 'swr'
import { createLogger } from '../shared/logger'
import { socialDAC, useSkynet } from '../contexts/skynet'
import { ControlRef } from '../contexts/skynet/ref'
import uniq from 'lodash/uniq'
import { IUser, WorkerParams } from '@riftdweb/types'
import { isUserUpToDate } from '../contexts/users'
import { apiLimiter } from '../contexts/skynet/api'
import { waitFor } from '../shared/wait'

const getKey = (userId: string): string => `users/${userId}`

type FetchUserParams = {
  syncUpdate?: boolean
  skipUpsert?: boolean
  priority?: number
}

export async function fetchUser(
  ref: ControlRef,
  userId: string,
  params: FetchUserParams = {}
): Promise<IUser> {
  const { syncUpdate = false, skipUpsert = false, priority = 0 } = params
  const log = createLogger(`profiles/${userId.slice(0, 5)}/fetch`, {
    // disable: true,
  })

  // Ensure main collection has loaded
  await waitFor(() => [ref.current, ref.current.usersMap.data], {
    log,
  })

  const existingUser = ref.current.getUser(userId)

  if (isUserUpToDate(existingUser)) {
    log('Up to date')
    return existingUser
  }

  if (existingUser) {
    // Exists but needs refresh, return existing data immediately and async refresh
    const func = async () => {
      log('Refreshing', existingUser)
      const profile = await fetchProfile(ref, existingUser, {
        priority,
      })
      const followingIds = await fetchFollowing(ref, existingUser, {
        priority,
      })

      const updatedUser = {
        ...existingUser,
        username: profile.username,
        profile,
        followingIds,
        updatedAt: new Date().getTime(),
      }

      if (!skipUpsert) {
        log('Upserting')
        ref.current.upsertUser(updatedUser)
      }
      return updatedUser
    }

    if (syncUpdate) {
      const updatedUser = await func()
      return updatedUser
    } else {
      func()
      return existingUser
    }
  }

  // User data has never been fetched
  let user: IUser = {
    userId,
    relationship: 'none',
    profile: {
      version: 1,
      username: '',
    },
    followingIds: [],
    followerIds: [],
    updatedAt: new Date().getTime(),
  }

  const profile = await fetchProfile(ref, user)
  const followingIds = await fetchFollowing(ref, user)

  user = {
    ...user,
    username: profile.username,
    profile,
    followingIds,
    updatedAt: new Date().getTime(),
  }

  if (!skipUpsert) {
    ref.current.upsertUser(user)
  }

  return user
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
  const _followingIds = await apiLimiter.add(task, { cost: 5, priority })
  const followingIds = uniq(_followingIds)

  return followingIds
}

export function useUser(userId: string): IUser | undefined {
  const { controlRef: ref } = useSkynet()
  const { data: user } = useSWR(
    userId ? getKey(userId) : null,
    () => fetchUser(ref, userId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 20_000,
    }
  )
  return user
}
