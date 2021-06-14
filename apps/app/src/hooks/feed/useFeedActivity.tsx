import useSWR from 'swr'
import { ActivityFeed } from './types'
import { fetchActivity } from './shared'
import { useSkynet } from '../skynet'
import { useEffect, useState } from 'react'
import { ControlRef } from '../skynet/useControlRef'

type Props = {
  ref: ControlRef
}

export function useFeedActivity({ ref }: Props) {
  const { getKey } = useSkynet()
  const [loadingState, setLoadingState] = useState<string>()

  const response = useSWR<ActivityFeed>(
    getKey(['feed', 'activity']),
    () => fetchActivity(ref),
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
    ref.current.feeds.activity = values
  }, [response, loadingState, setLoadingState])

  return values
}
