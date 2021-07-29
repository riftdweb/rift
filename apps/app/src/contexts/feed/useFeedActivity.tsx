import useSWR from 'swr'
import { ActivityFeed } from './types'
import { fetchActivity } from '../../workers/shared'
import { useSkynet } from '../skynet'
import { useEffect, useMemo, useState } from 'react'
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

  const values = useMemo(
    () => ({
      response,
      loadingState,
      setLoadingState,
    }),
    [response, loadingState, setLoadingState]
  )

  useEffect(() => {
    ref.current.feeds.activity = values
  }, [ref, values])

  return values
}
