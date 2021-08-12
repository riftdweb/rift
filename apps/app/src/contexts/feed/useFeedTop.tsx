import useSWR from 'swr'
import { EntryFeed } from './types'
import { fetchTopEntries } from '../../workers/workerApi'
import { useSkynet } from '../skynet'
import { useEffect, useMemo, useState } from 'react'
import { ControlRef } from '../skynet/ref'

type Props = { ref: ControlRef }

export function useFeedTop({ ref }: Props) {
  const { getKey } = useSkynet()
  const [loadingState, setLoadingState] = useState<string>()

  const response = useSWR<EntryFeed>(
    getKey(['feed', 'top']),
    () =>
      fetchTopEntries(ref, {
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
    ref.current.feeds.top = values
  }, [ref, values])

  return values
}
