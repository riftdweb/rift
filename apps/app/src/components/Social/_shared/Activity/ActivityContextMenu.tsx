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
import { Link as RLink } from 'react-router-dom'
import {
  useFeed,
  useSkynet,
  getDataKeyFeeds,
  SpinnerIcon,
} from '@riftdweb/core'

type Props = {
  variant?: ButtonVariant
  right?: string
  size?: '1' | '2'
}

export function ActivityContextMenu({
  variant,
  right = '0',
  size = '1',
}: Props) {
  const { myUserId, appDomain } = useSkynet()
  const { activity, refreshActivity } = useFeed()
  return (
    <DropdownMenu>
      <Tooltip
        align="end"
        content={activity.loadingState || 'Open activity menu'}
      >
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
            {activity.loadingState ? <SpinnerIcon /> : <DotsHorizontalIcon />}
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          disabled={!!activity.loadingState}
          onSelect={() => refreshActivity()}
        >
          Refresh
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Data</DropdownMenuLabel>
        <DropdownMenuItem
          as={RLink}
          to={`/data/mysky/${myUserId}/${appDomain}/${getDataKeyFeeds(
            'activity'
          )}`}
          css={{
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '$blue9',
            },
          }}
        >
          Activity
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
