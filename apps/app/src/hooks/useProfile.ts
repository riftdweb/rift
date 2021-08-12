import {
  IProfileIndex,
  IUserProfile,
} from '@skynethub/userprofile-library/dist/types'
import useSWR from 'swr'
import { createLogger } from '../shared/logger'
import { socialDAC, useSkynet } from '../contexts/skynet'
import { ControlRef } from '../contexts/skynet/ref'
import uniq from 'lodash/uniq'
import { IUser } from '@riftdweb/types'
import { isUserUpToDate } from '../contexts/users'
import { apiLimiter } from '../contexts/skynet/api'

const getKey = (userId: string): string => `users/${userId}`

type FetchUserParams = {
  syncUpdate?: boolean
  skipUpsert?: boolean
}

export async function fetchUser(
  ref: ControlRef,
  userId: string,
  params: FetchUserParams = {}
): Promise<IUser> {
  const { syncUpdate = false, skipUpsert = false } = params
  const log = createLogger(`profiles/${userId.slice(0, 5)}/fetch`, {
    disable: true,
  })

  const existingUser = ref.current.getUser(userId)

  if (isUserUpToDate(existingUser)) {
    return existingUser
  }

  if (existingUser) {
    // Exists but needs refresh, return existing data immediately and async refresh
    const func = async () => {
      log('Async fetching')
      const profile = await fetchProfile(ref, existingUser)
      const followingIds = await fetchFollowing(ref, existingUser)

      const updatedUser = {
        ...existingUser,
        username: profile.username,
        profile,
        followingIds,
        updatedAt: new Date().getTime(),
      }

      if (!skipUpsert) {
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
  user: IUser
): Promise<IUserProfile> {
  const response = await ref.current.Api.getJSON<IProfileIndex>({
    publicKey: user.userId,
    domain: 'profile-dac.hns',
    path: 'profileIndex.json',
    discoverable: true,
  })

  let profile = response.data?.profile || {
    version: 1,
    username: '',
  }

  return profile
}

async function fetchFollowing(ref: ControlRef, user: IUser): Promise<string[]> {
  const task = async () => {
    try {
      return socialDAC.getFollowingForUser(user.userId)
    } catch (e) {
      return []
    }
  }
  const _followingIds = await apiLimiter.add(task, { cost: 5 })
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
