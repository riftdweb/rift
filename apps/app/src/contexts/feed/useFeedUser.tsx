import useSWR from 'swr'
import { EntryFeed } from './types'
import { fetchUserEntries } from '../../workers/shared'
import { useSkynet } from '../skynet'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
      setLoadingStateMap((loadingStateMap) => ({
        ...loadingStateMap,
        [userId]: state,
      }))
    },
    [setLoadingStateMap]
  )

  const loadingState = useMemo(() => getLoadingState(viewingUserId), [
    getLoadingState,
    viewingUserId,
  ])

  const values = useMemo(
    () => ({
      response,
      loadingStateCurrentUser: loadingState,
      loadingStateMap,
      getLoadingState,
      setLoadingState,
    }),
    [response, loadingState, loadingStateMap, getLoadingState, setLoadingState]
  )

  useEffect(() => {
    ref.current.feeds.user = values
  }, [ref, values])

  return values
}
