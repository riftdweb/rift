import { PersonIcon, RocketIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  ButtonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  keyframes,
  Tooltip,
} from '@riftdweb/design-system'
import { useState } from 'react'
import { useSkynet } from '../../contexts/skynet'
import { copyToClipboard } from '../../shared/clipboard'
import { Avatar } from '../_shared/Avatar'

const pulse = keyframes({
  '0%': {
    transform: 'scale(1)',
    opacity: 1,
  },
  '100%': {
    transform: 'scale(2)',
    opacity: 0,
  },
})

type Props = {
  variant?: ButtonVariants['variant']
  right?: string
  size?: string
}

export function IdentityContextMenu({
  variant = 'gray',
  right = '0',
  size = '1',
}: Props) {
  const { myUserId, myUser, logout, login } = useSkynet()
  const [isOpen, setIsOpen] = useState<boolean>()

  if (!myUserId) {
    return (
      <DropdownMenu onOpenChange={setIsOpen}>
        <Tooltip align="end" content="Log in with MySky">
          <DropdownMenuTrigger
            as={Button}
            variant={variant}
            size={size}
            css={{
              right,
              position: 'relative',
            }}
          >
            <RocketIcon />
            {!isOpen && (
              <Box
                css={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: '$violet900',
                  borderRadius: '$round',
                  height: '8px',
                  width: '8px',
                  animation: `${pulse} 2s infinite`,
                  willChange: 'transform',
                }}
              />
            )}
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>No account</DropdownMenuLabel>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onSelect={login}>
            Log in with MySky
            {isOpen && (
              <Box
                css={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  backgroundColor: '$violet900',
                  borderRadius: '$round',
                  height: '8px',
                  width: '8px',
                  animation: `${pulse} 2s infinite`,
                  willChange: 'transform',
                }}
              />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <Tooltip align="end" content="Open MySky menu">
        {!myUser ? (
          <DropdownMenuTrigger
            as={Button}
            variant={variant}
            size={size}
            css={{
              right,
              position: 'relative',
            }}
          >
            <PersonIcon />
          </DropdownMenuTrigger>
        ) : (
          <DropdownMenuTrigger>
            <Avatar userId={myUserId} profile={myUser.profile.data} />
          </DropdownMenuTrigger>
        )}
      </Tooltip>
      <DropdownMenuContent align="end">
        {myUser ? (
          <DropdownMenuLabel>{myUser.username}</DropdownMenuLabel>
        ) : (
          <DropdownMenuLabel>User {myUserId.slice(0, 6)}...</DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onSelect={logout}>Log out</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Copy</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => copyToClipboard(myUserId, 'user ID')}>
          User ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
