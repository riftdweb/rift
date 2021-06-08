import useSWR from 'swr'
import { EntryFeed } from './types'
import { fetchTopEntries } from './shared'
import { useSkynet } from '../skynet'
import { useState } from 'react'
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

  return {
    response,
    loadingState,
    setLoadingState,
  }
}
