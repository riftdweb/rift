import useSWR from 'swr'
import { EntryFeed } from './types'
import { fetchUserEntries } from './shared'
import { useSkynet } from '../skynet'
import { useCallback, useMemo, useState } from 'react'
import { useParamUserId } from './useParamUserId'
import { ControlRef } from '../skynet/useControlRef'

type Props = { ref: ControlRef }

export function useFeedUser({ ref }: Props) {
  const { getKey } = useSkynet()
  const viewingUserId = useParamUserId()
  const [loadingStateMap, setLoadingStateMap] = useState<{
    [userId: string]: string | undefined
  }>({})

  const response = useSWR<EntryFeed>(
    viewingUserId ? getKey(['feed', viewingUserId]) : null,
    () => fetchUserEntries(ref, viewingUserId),
    {
      revalidateOnFocus: false,
    }
  )

  const getLoadingState = useCallback(
    (userId: string) => {
      return loadingStateMap[userId]
    },
    [loadingStateMap]
  )

  const setLoadingState = useCallback(
    (userId: string, state?: string) => {
      setLoadingStateMap({
        ...loadingStateMap,
        [userId]: state,
      })
    },
    [setLoadingStateMap, loadingStateMap]
  )

  const loadingState = useMemo(() => getLoadingState(viewingUserId), [
    getLoadingState,
    viewingUserId,
  ])

  return {
    response,
    loadingStateCurrentUser: loadingState,
    getLoadingState,
    setLoadingState,
  }
}
