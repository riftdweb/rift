import useSWR from 'swr'
import { EntryFeed } from './types'
import { fetchTopEntries } from './shared'
import { useSkynet } from '../skynet'
import { useEffect, useState } from 'react'
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

  const values = {
    response,
    loadingState,
    setLoadingState,
  }

  useEffect(() => {
    ref.current.feeds.top = values
  }, [response, loadingState, setLoadingState])

  return values
}
