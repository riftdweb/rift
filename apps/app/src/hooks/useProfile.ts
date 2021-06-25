import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import useSWR from 'swr'
import { userProfileDAC } from './skynet'

const getKey = (userId: string): string => `users/${userId}`

export async function fetchProfile(userId: string) {
  const profile = await userProfileDAC.getProfile(userId)

  if (profile.error) {
    throw Error('getProfile failed')
  } else {
    return profile
  }
}

export function useProfile(userId: string): IUserProfile | undefined {
  const { data: profile } = useSWR(
    userId ? getKey(userId) : null,
    () => fetchProfile(userId),
    {
      revalidateOnFocus: false,
    }
  )
  return profile
}
