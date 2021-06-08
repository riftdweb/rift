import { Fragment } from 'react'
import { Flex, Box, Subheading, Text } from '@riftdweb/design-system'
import { useHasNoEntries } from '../../hooks/useHasNoEntries'
import SpinnerIcon from '../_icons/SpinnerIcon'
import { SWRResponse } from 'swr'
import { Feed } from '../../hooks/feed/types'

function NonIdealState({ title, message }) {
  return (
    <Flex
      css={{
        flexDirection: 'column',
        alignItems: 'center',
        gap: '$2',
        margin: '30px auto',
        color: '$gray900',
      }}
    >
      <Subheading>{title}</Subheading>
      <Text size="2" css={{ color: '$gray900' }}>
        {message}
      </Text>
    </Flex>
  )
}

function LoadingState({ message }) {
  return (
    <Flex
      css={{
        flexDirection: 'column',
        alignItems: 'center',
        gap: '$2',
        margin: '30px auto',
        color: '$gray900',
      }}
    >
      <SpinnerIcon />
      <Text size="2" css={{ color: '$gray900' }}>
        {message}
      </Text>
    </Flex>
  )
}

type Response<T> = SWRResponse<Feed<T>, any>

type Props<T> = {
  response: Response<T>
  loadingState?: string
  emptyTitle: string
  emptyMessage: string
  children: React.ReactNode
}

export function EntriesState<T>({
  response,
  loadingState,
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
    return <LoadingState message="Loading feed" />
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
