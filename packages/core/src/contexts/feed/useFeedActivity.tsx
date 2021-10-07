import React, { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { ActivityFeed } from '@riftdweb/types'
import { fetchActivity } from '../../services/serviceApi'
import { useSkynet } from '../skynet'
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
    ref.current.feeds.activity = values
  }, [ref, values])

  return values
}
