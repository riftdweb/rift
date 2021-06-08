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
import { useCallback } from 'react'
import { Link as RLink } from 'react-router-dom'
import { useFeed } from '../../../hooks/feed'
import { dataVersion } from '../../../hooks/feed/shared'
import { useSkynet } from '../../../hooks/skynet'
import SpinnerIcon from '../../_icons/SpinnerIcon'

type Props = {
  variant?: ButtonVariants['variant']
  right?: string
  size?: string
}

export function ProfileContextMenu({
  variant = 'ghost',
  right = '0',
  size = '1',
}: Props) {
  const { userId: myUserId, dataDomain: appDomain } = useSkynet()
  const { refreshUser, user, userId } = useFeed()

  const refresh = useCallback(() => {
    refreshUser(userId)
  }, [userId, refreshUser])

  return (
    <DropdownMenu>
      <Tooltip
        align="end"
        content={user.loadingStateCurrentUser || 'Open profile menu'}
      >
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
          {user.loadingStateCurrentUser ? (
            <SpinnerIcon />
          ) : (
            <DotsHorizontalIcon />
          )}
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          disabled={!!user.loadingStateCurrentUser}
          onSelect={() => refresh()}
        >
          Refresh
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Data</DropdownMenuLabel>
        <DropdownMenuItem
          as={RLink}
          to={`/data/mysky/${myUserId}/${appDomain}/${dataVersion}/entries/${userId}`}
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
