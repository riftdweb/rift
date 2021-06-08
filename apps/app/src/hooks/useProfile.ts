import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import useSWR from 'swr'
import { userProfileDAC } from './skynet'

const minute = 1000 * 60
const minutes1 = minute * 1

const dataVersion = '1'
const getKey = (userId) => `v${dataVersion}/users/${userId}`

export async function fetchProfile(userId: string) {
  const key = getKey(userId)
  const cacheString = localStorage.getItem(key)

  let cacheData = null

  try {
    cacheData = cacheString ? JSON.parse(cacheString) : null
  } catch (e) {
    localStorage.removeItem(key)
  }

  const now = new Date().getTime()
  if (now - cacheData.updatedAt < minutes1) {
    return cacheData.profile
  }

  const profile = await userProfileDAC.getProfile(userId)

  if (profile.error) {
    return undefined
  } else {
    localStorage.setItem(
      key,
      JSON.stringify({
        updatedAt: new Date().getTime(),
        profile,
      })
    )
    return profile
  }
}

export function useProfile(userId: string): IUserProfile | undefined {
  const { data: profile } = useSWR(userId ? getKey(userId) : null, () =>
    fetchProfile(userId)
  )
  return profile
}
