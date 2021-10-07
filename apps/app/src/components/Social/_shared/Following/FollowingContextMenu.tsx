import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  Button,
  ButtonVariants,
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
  variant?: ButtonVariants['variant']
  right?: string
  size?: string
}

export function FollowingContextMenu({
  variant = 'ghost',
  right = '0',
  size = '1',
}: Props) {
  const { myUserId, appDomain } = useSkynet()
  return (
    <DropdownMenu>
      <Tooltip align="end" content="Open following menu">
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
          <DotsHorizontalIcon />
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
              backgroundColor: '$blue800',
            },
          }}
        >
          Following
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
