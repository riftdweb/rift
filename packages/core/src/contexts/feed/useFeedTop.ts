import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { EntryFeed } from '@riftdweb/types'
import { fetchTopEntries } from '../../services/serviceApi'
import { useSkynet } from '../skynet'
import { ControlRef } from '../skynet/ref'

type Props = { ref: ControlRef }

export function useFeedTop({ ref }: Props) {
  const { getKey } = useSkynet()
  const [loadingState, setLoadingState] = useState<string>()

  const response = useSWR<EntryFeed>(
    getKey(['feed', 'top']),
    () =>
      fetchTopEntries(ref, {
        priority: 4,
      }),
    {
      revalidateOnFocus: false,
    }
  )

  const values = useMemo(
    () => ({
      response,
      loadingState,
      setLoadingState,
    }),
    [response, loadingState, setLoadingState]
  )

  useEffect(() => {
    ref.current.feeds.top = values
  }, [ref, values])

  return values
}
