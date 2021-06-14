import useSWR from 'swr'
import { EntryFeed } from './types'
import { fetchAllEntries } from './shared'
import { useSkynet } from '../skynet'
import { useEffect, useState } from 'react'
import { ControlRef } from '../skynet/useControlRef'

type Props = { ref: ControlRef }

export function useFeedLatest({ ref }: Props) {
  const { getKey } = useSkynet()
  const [loadingState, setLoadingState] = useState<string>()

  const response = useSWR<EntryFeed>(
    getKey(['feed', 'latest']),
    () => fetchAllEntries(ref),
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
    ref.current.feeds.latest = values
  }, [response, loadingState, setLoadingState])

  return values
}
