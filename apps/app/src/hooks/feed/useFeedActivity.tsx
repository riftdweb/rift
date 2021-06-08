import useSWR, { SWRResponse } from 'swr'
import { ActivityFeed } from './types'
import { fetchActivity } from './shared'
import { useSkynet } from '../skynet'
import { useState } from 'react'
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

  return {
    response,
    loadingState,
    setLoadingState,
  }
}
