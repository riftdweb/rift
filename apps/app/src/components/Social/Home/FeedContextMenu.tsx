import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  Button,
  ButtonVariant,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
} from '@riftdweb/design-system'
import { Fragment } from 'react'
import { Link as RLink } from 'react-router-dom'
import {
  useFeed,
  useSkynet,
  DATA_PRIVATE_FEATURES,
  getDataKeyFeeds,
  SpinnerIcon,
} from '@riftdweb/core'

type Props = {
  variant?: ButtonVariant
  right?: string
  size?: '1' | '2'
}

export function FeedContextMenu({ variant, right = '0', size = '1' }: Props) {
  const { myUserId, appDomain } = useSkynet()
  const { refreshCurrentFeed, current } = useFeed()

  return (
    <DropdownMenu>
      <Tooltip align="end" content={current.loadingState || 'Open feed menu'}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            ghost={!variant}
            size={size}
            css={{
              right,
              position: 'relative',
              color: '$gray6',
              '&:hover': {
                color: '$gray11',
              },
            }}
          >
            {current.loadingState ? <SpinnerIcon /> : <DotsHorizontalIcon />}
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          // disabled={!!current.loadingState}
          onSelect={() => refreshCurrentFeed()}
        >
          Refresh
        </DropdownMenuItem>
        {DATA_PRIVATE_FEATURES && (
          <Fragment>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Data</DropdownMenuLabel>
            <DropdownMenuItem
              as={RLink}
              to={`/data/mysky/${myUserId}/${appDomain}/${getDataKeyFeeds(
                'entries/top'
              )}`}
              css={{
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '$blue9',
                },
              }}
            >
              Feed
            </DropdownMenuItem>
          </Fragment>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
