import useSWR from 'swr'
import { IUser } from '@riftdweb/types'
import { syncUser } from '../services/syncUser'
import { getDataKeyUsers } from '../shared/dataKeys'
import { useAccount } from './useAccount'

export function useUser(userId?: string): IUser | undefined {
  const { isReady } = useAccount()

  const { data: user } = useSWR(
    isReady && userId ? getDataKeyUsers(userId) : null,
    () => syncUser(userId, 'render'),
    {
      revalidateOnFocus: false,
    }
  )

  return user
}
