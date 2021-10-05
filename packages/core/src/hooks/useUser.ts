import useSWR from 'swr'
import { useSkynet } from '../contexts/skynet'
import { IUser } from '@riftdweb/types'
import { syncUser } from '../services/user'
import { getDataKeyUsers } from '../shared/dataKeys'

export function useUser(userId?: string): IUser | undefined {
  const { controlRef: ref, getKey } = useSkynet()
  const { data: user } = useSWR(
    userId && ref ? getKey([getDataKeyUsers(userId)]) : null,
    () => syncUser(ref, userId, 'render'),
    {
      revalidateOnFocus: false,
    }
  )
  return user
}
