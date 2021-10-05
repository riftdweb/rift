import useSWR from 'swr'
import { Entry, EntryFeed } from '@riftdweb/types'
import { fetchAllEntries } from '../../services/serviceApi'
import { useSkynet } from '../skynet'
import { useEffect, useMemo, useState } from 'react'
import { ControlRef } from '../skynet/ref'
import { dedupePendingUserEntries } from './utils'

type Props = {
  ref: ControlRef
  pendingUserEntries: Entry[]
}

export function useFeedLatest({ ref, pendingUserEntries }: Props) {
  const { getKey } = useSkynet()
  const [loadingState, setLoadingState] = useState<string>()

  const response = useSWR<EntryFeed>(
    getKey(['feed', 'latest']),
    () =>
      fetchAllEntries(ref, {
        priority: 4,
      }),
    {
      revalidateOnFocus: false,
    }
  )

  const responseWithPending = useMemo(
    () =>
      response.data && pendingUserEntries.length
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
    [response, pendingUserEntries]
  )

  const values = useMemo(
    () => ({
      response: responseWithPending,
      loadingState,
      setLoadingState,
    }),
    [responseWithPending, loadingState, setLoadingState]
  )

  useEffect(() => {
    ref.current.feeds.latest = values
  }, [ref, values])

  return values
}
