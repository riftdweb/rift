import {
  IProfileIndex,
  IUserProfile,
} from '@skynethub/userprofile-library/dist/types'
import useSWR from 'swr'
import { createLogger } from '../shared/logger'
import { useSkynet } from './skynet'
import { ControlRef } from './skynet/useControlRef'

// 5 minutes
const CACHE_TIMEOUT = 1000 * 5 * 60

const cache: {
  [userId: string]: {
    profile: IUserProfile
    updatedAt: number
  }
} = {}

const getKey = (userId: string): string => `users/${userId}`

export async function fetchProfile(
  ref: ControlRef,
  userId: string
): Promise<IUserProfile> {
  const log = createLogger(`profiles/${userId.slice(0, 5)}/fetch`, {
    disable: true,
  })

  const cacheEntry = cache[userId]
  const now = new Date().getTime()
  if (cacheEntry && now - cacheEntry.updatedAt < CACHE_TIMEOUT) {
    log('hit cache')
    return cacheEntry.profile
  }
  log('no cache')

  const response = await ref.current.Api.getJSON<IProfileIndex>({
    publicKey: userId,
    domain: 'profile-dac.hns',
    path: 'profileIndex.json',
    discoverable: true,
  })

  if (!response.data?.profile) {
    return {
      version: 1,
      username: '',
    }
  } else {
    cache[userId] = {
      profile: response.data.profile,
      updatedAt: new Date().getTime(),
    }
    // TODO: mutate users context to keep it in sync
    return response.data.profile
  }
}

export function useProfile(userId: string): IUserProfile | undefined {
  const { controlRef: ref } = useSkynet()
  const { data: profile } = useSWR(
    userId ? getKey(userId) : null,
    () => fetchProfile(ref, userId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 20_000,
    }
  )
  return profile
}
