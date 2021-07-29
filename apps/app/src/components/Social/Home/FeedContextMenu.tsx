import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  Button,
  ButtonVariants,
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
import { useFeed } from '../../../contexts/feed'
import { useSkynet } from '../../../contexts/skynet'
import { DATA_PRIVATE_FEATURES } from '../../../shared/config'
import { getDataKeyFeeds } from '../../../shared/dataKeys'
import SpinnerIcon from '../../_icons/SpinnerIcon'

type Props = {
  variant?: ButtonVariants['variant']
  right?: string
  size?: string
}

export function FeedContextMenu({
  variant = 'ghost',
  right = '0',
  size = '1',
}: Props) {
  const { myUserId, appDomain } = useSkynet()
  const { refreshCurrentFeed, current } = useFeed()

  return (
    <DropdownMenu>
      <Tooltip align="end" content={current.loadingState || 'Open feed menu'}>
        <DropdownMenuTrigger
          as={Button}
          variant={variant}
          size={size}
          css={{
            right,
            position: 'relative',
            color: '$gray500',
            '&:hover': {
              color: '$gray900',
            },
          }}
        >
          {current.loadingState ? <SpinnerIcon /> : <DotsHorizontalIcon />}
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
                  backgroundColor: '$blue800',
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
