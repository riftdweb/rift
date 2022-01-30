import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  Button,
  ButtonVariant,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Tooltip,
} from '@riftdweb/design-system'
import { Link as RLink } from 'react-router-dom'
import { getDataKeyFeeds, SpinnerIcon } from '@riftdweb/core'
import { useAccount } from '@riftdweb/core/src/hooks/useAccount'

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
  const { myUserId, appDomain } = useAccount()
  const loadingState = false
  return (
    <DropdownMenu>
      <Tooltip align="end" content={loadingState || 'Open activity menu'}>
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
            {loadingState ? <SpinnerIcon /> : <DotsHorizontalIcon />}
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
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
