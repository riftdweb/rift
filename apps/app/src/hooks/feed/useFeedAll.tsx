import useSWR from 'swr'
import { EntryFeed } from './types'
import { fetchAllEntries } from './shared'
import { useSkynet } from '../skynet'
import { useState } from 'react'
import { ControlRef } from '../skynet/useControlRef'

type Props = { ref: ControlRef }

export function useFeedAll({ ref }: Props) {
  const { getKey } = useSkynet()
  const [loadingState, setLoadingState] = useState<string>()

  const response = useSWR<EntryFeed>(
    getKey(['feed', 'latest']),
    () => fetchAllEntries(ref),
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
