import { Fragment } from 'react'
import { Box, Subheading, Text } from '@riftdweb/design-system'
import { useHasNoEntries } from '../../hooks/useHasNoEntries'
import SpinnerIcon from '../_icons/SpinnerIcon'
import { SWRResponse } from 'swr'
import { Feed } from '../../hooks/feed/types'

function NonIdealState({ title, message }) {
  return (
    <Box css={{ textAlign: 'center', padding: '$3 0' }}>
      <Subheading css={{ margin: '$2 0' }}>{title}</Subheading>
      <Text css={{ color: '$gray900' }}>{message}</Text>
    </Box>
  )
}

type Response<T> = SWRResponse<Feed<T>, any>

type Props<T> = {
  response: Response<T>
  emptyTitle: string
  emptyMessage: string
  children: React.ReactNode
}

export function EntriesState<T>({
  response,
  emptyTitle,
  emptyMessage,
  children,
}: Props<T>) {
  const hasNoEntries = useHasNoEntries(response.data)

  return response.data?.entries.length ? (
    <Fragment>{children}</Fragment>
  ) : response.isValidating ? (
    hasNoEntries ? (
      <NonIdealState title={emptyTitle} message={emptyMessage} />
    ) : (
      <Box css={{ margin: '0 auto' }}>
        <SpinnerIcon />
      </Box>
    )
  ) : (
    <NonIdealState title={emptyTitle} message={emptyMessage} />
  )
}
