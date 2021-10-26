import React, { useState } from 'react'
import { ExternalLinkIcon, PersonIcon, RocketIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  ButtonVariant,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  keyframes,
  Link,
  Tooltip,
} from '@riftdweb/design-system'
import { useSkynet } from '../../../contexts/skynet'
import { usePortal } from '../../../hooks/usePortal'
import { useUser } from '../../../hooks/useUser'
import { copyToClipboard } from '../../../shared/clipboard'
import { Avatar } from '../../Avatar'

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
  variant?: ButtonVariant
  right?: string
  size?: '1' | '2'
}

export function IdentityContextMenu({
  variant = 'gray',
  right = '0',
  size = '1',
}: Props) {
  const { portal } = usePortal()
  const { myUserId, logout, login } = useSkynet()
  const myUser = useUser(myUserId)
  const [isOpen, setIsOpen] = useState<boolean>()

  if (!myUserId) {
    return (
      <DropdownMenu onOpenChange={setIsOpen}>
        <Tooltip align="end" content="Log in with Skynet">
          <DropdownMenuTrigger asChild>
            <Button
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
                    backgroundColor: '$violet10',
                    borderRadius: '$round',
                    height: '8px',
                    width: '8px',
                    animation: `${pulse} 2s infinite`,
                    willChange: 'transform',
                  }}
                />
              )}
            </Button>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>No account</DropdownMenuLabel>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onSelect={login}>
            Log in with Skynet
            {isOpen && (
              <Box
                css={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  backgroundColor: '$violet10',
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
          <DropdownMenuTrigger asChild>
            <Button
              variant={variant}
              size={size}
              css={{
                right,
                position: 'relative',
              }}
            >
              <PersonIcon />
            </Button>
          </DropdownMenuTrigger>
        ) : (
          <DropdownMenuTrigger asChild>
            <Button
              css={{
                boxShadow: 'none',
                padding: 0,
                '&:active, &:hover, &:focus': {
                  boxShadow: 'none',
                },
              }}
            >
              <Avatar userId={myUserId} profile={myUser.profile.data} />
            </Button>
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
        <DropdownMenuItem
          as={Link}
          target="_blank"
          href={`https://skyprofile.hns.${portal}`}
          css={{
            backgroundColor: 'none !important',
            textDecoration: 'none !important',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '$blue9',
            },
            '&:hover > div': {
              color: 'white',
            },
          }}
        >
          Edit profile
          <Box
            css={{ color: '$gray11', '&:hover': { color: 'white' }, ml: '$1' }}
          >
            <ExternalLinkIcon />
          </Box>
        </DropdownMenuItem>
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
