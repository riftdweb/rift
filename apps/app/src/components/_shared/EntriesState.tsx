import { Fragment } from 'react'
import { useHasNoEntries } from '../../hooks/useHasNoEntries'
import { SWRResponse } from 'swr'
import { Feed } from '@riftdweb/types'
import { NonIdealState } from './NonIdealState'
import { LoadingState } from './LoadingState'

export type EntriesResponse<T> = {
  data?: Feed<T>
  // Compatible with SWRRResponse
  error?: SWRResponse<Feed<T>, any>['error']
  revalidate?: SWRResponse<Feed<T>, any>['revalidate']
  mutate?: SWRResponse<Feed<T>, any>['mutate']
  isValidating?: boolean
}

type Props<T> = {
  response: EntriesResponse<T>
  loadingState?: string
  emptyTitle?: string
  emptyMessage?: string
  validatingMessage?: string
  children: React.ReactNode
}

export function EntriesState<T>({
  response,
  loadingState,
  validatingMessage,
  emptyTitle,
  emptyMessage,
  children,
}: Props<T>) {
  const hasNoEntries = useHasNoEntries(response.data)

  // If data has been previously fetched and there are more than zero entries
  // leave the list rendered even if loading or fetching is happening in the background
  if (response.data?.entries.length) {
    return <Fragment>{children}</Fragment>
  }

  // If an explicit loading state is provided render it
  if (loadingState) {
    return <LoadingState message={`${loadingState}...`} />
  }
  // If SWR is validating, render generic loading state
  if (response.isValidating) {
    return <LoadingState message={validatingMessage || 'Loading feed'} />
  }

  // If data has been previously fetched and no entries exist yet
  if (hasNoEntries) {
    // Else no entries exist, non ideal state
    return <NonIdealState title={emptyTitle} message={emptyMessage} />
  } else {
    // Should only be here on page load, right before fetching kicks off
    return null
  }
}
