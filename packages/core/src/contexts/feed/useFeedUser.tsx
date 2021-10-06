import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import useSWR from 'swr'
import { Entry, EntryFeed } from '@riftdweb/types'
import { fetchUserEntries } from '../../services/serviceApi'
import { useSkynet } from '../skynet'
import { useParamUserId } from './useParamUserId'
import { ControlRef } from '../skynet/ref'
import { dedupePendingUserEntries } from './utils'

type Props = {
  ref: ControlRef
  pendingUserEntries: Entry[]
  setPendingUserEntries: Dispatch<SetStateAction<Entry[]>>
}

export function useFeedUser({
  ref,
  pendingUserEntries,
  setPendingUserEntries,
}: Props) {
  const { myUserId, getKey } = useSkynet()
  const viewingUserId = useParamUserId()
  const isMyFeed = myUserId === viewingUserId
  const [loadingStateMap, setLoadingStateMap] = useState<{
    [userId: string]: string | undefined
  }>({})

  const response = useSWR<EntryFeed>(
    viewingUserId ? getKey(['feed', viewingUserId]) : null,
    () =>
      fetchUserEntries(ref, viewingUserId, {
        priority: 4,
      }),
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

  const responseWithPending = useMemo(
    () =>
      isMyFeed && response.data && pendingUserEntries.length
        ? {
            ...response,
            data: {
              entries: dedupePendingUserEntries(
                response.data.entries,
                pendingUserEntries
              ),
              updatedAt: response.data.updatedAt,
              null: response.data.null,
            },
          }
        : response,
    [response, pendingUserEntries, isMyFeed]
  )

  const values = useMemo(
    () => ({
      response: responseWithPending,
      loadingStateCurrentUser: loadingState,
      loadingStateMap,
      getLoadingState,
      setLoadingState,
    }),
    [
      responseWithPending,
      loadingState,
      loadingStateMap,
      getLoadingState,
      setLoadingState,
    ]
  )

  useEffect(() => {
    ref.current.feeds.user = values
  }, [ref, values])

  return values
}
