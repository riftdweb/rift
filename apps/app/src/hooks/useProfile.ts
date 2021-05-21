import useSWR from 'swr'
import { userProfileDAC } from './skynet'

export function useProfile(userId) {
  const { data: profile } = useSWR(['users', userId], () =>
    userProfileDAC.getProfile(userId)
  )
  return profile
}
