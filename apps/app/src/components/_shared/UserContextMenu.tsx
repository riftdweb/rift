import { DotsHorizontalIcon, PersonIcon } from '@radix-ui/react-icons'
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
import { useState } from 'react'
import { copyToClipboard } from '../../shared/clipboard'
import { Link as RLink } from 'react-router-dom'
import { IUserProfile } from '@skynethub/userprofile-library/dist/types'

type Props = {
  userId: string
  profile: IUserProfile
  handleUnfollow?: (userId: string) => void
  variant?: ButtonVariants['variant']
  right?: string
  size?: string
}

export function UserContextMenu({
  userId,
  profile,
  handleUnfollow,
  variant = 'ghost',
  right = '0',
  size = '1',
}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>()

  return (
    <DropdownMenu>
      <Tooltip align="end" content="Open user menu">
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
        {profile ? (
          <DropdownMenuLabel>{profile.username}</DropdownMenuLabel>
        ) : (
          <DropdownMenuLabel>User {userId.slice(0, 6)}...</DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {handleUnfollow && (
          <DropdownMenuItem onSelect={() => handleUnfollow(userId)}>
            Unfollow
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          as={RLink}
          to={`/data/mysky/${userId}`}
          css={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          View Data
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Copy</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => copyToClipboard(userId, 'user ID')}>
          User ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
