import useSWR from 'swr'
import { ActivityFeed } from './types'
import { fetchActivity } from '../../workers/workerApi'
import { useSkynet } from '../skynet'
import { useEffect, useMemo, useState } from 'react'
import { ControlRef } from '../skynet/ref'

type Props = {
  ref: ControlRef
}

export function useFeedActivity({ ref }: Props) {
  const { getKey } = useSkynet()
  const [loadingState, setLoadingState] = useState<string>()

  const response = useSWR<ActivityFeed>(
    getKey(['feed', 'activity']),
    () =>
      fetchActivity(ref, {
        prioritize: true,
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
    ref.current.feeds.activity = values
  }, [ref, values])

  return values
}
