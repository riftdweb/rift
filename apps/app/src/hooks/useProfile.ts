import {
  IProfileIndex,
  IUserProfile,
} from '@skynethub/userprofile-library/dist/types'
import useSWR from 'swr'
import { useSkynet } from './skynet'
import { ControlRef } from './skynet/useControlRef'

const getKey = (userId: string): string => `users/${userId}`

export async function fetchProfile(
  ref: ControlRef,
  userId: string
): Promise<IUserProfile> {
  try {
    const profile = await ref.current.Api.getJSON<IProfileIndex>({
      publicKey: userId,
      dataDomain: 'profile-dac.hns',
      dataKey: 'profileIndex.json',
    })

    if (!profile.data?.profile) {
      return {
        version: 1,
        username: '',
      }
    } else {
      return profile.data.profile
    }
  } catch (e) {
    return {
      version: 1,
      username: '',
    }
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
