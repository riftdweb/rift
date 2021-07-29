import useSWR from 'swr'
import { EntryFeed } from './types'
import { fetchTopEntries } from '../../workers/shared'
import { useSkynet } from '../skynet'
import { useEffect, useMemo, useState } from 'react'
import { ControlRef } from '../skynet/useControlRef'

type Props = { ref: ControlRef }

export function useFeedTop({ ref }: Props) {
  const { getKey } = useSkynet()
  const [loadingState, setLoadingState] = useState<string>()

  const response = useSWR<EntryFeed>(
    getKey(['feed', 'top']),
    () => fetchTopEntries(ref),
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
