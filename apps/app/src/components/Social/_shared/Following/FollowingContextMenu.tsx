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
import { useSkynet } from '@riftdweb/core'

type Props = {
  variant?: ButtonVariant
  right?: string
  size?: '1' | '2'
}

export function FollowingContextMenu({
  variant,
  right = '0',
  size = '1',
}: Props) {
  const { myUserId, appDomain } = useSkynet()
  return (
    <DropdownMenu>
      <Tooltip align="end" content="Open following menu">
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
            <DotsHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Data</DropdownMenuLabel>
        <DropdownMenuItem
          as={RLink}
          to={`/data/mysky/${myUserId}/social-dac.hns/${appDomain}/following.json`}
          css={{
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '$blue9',
            },
          }}
        >
          Following
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
