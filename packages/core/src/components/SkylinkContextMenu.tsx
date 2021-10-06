import React from 'react'
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
} from '@riftdweb/design-system'
import { useSkylink } from '../hooks/useSkylink'
import { copyToClipboard } from '../shared/clipboard'

type Props = {
  skylink: string
  skipFetch?: boolean
  variant?: ButtonVariants['variant']
  size?: string
  right?: string
}

export function SkylinkContextMenu({
  skylink: rawSkylink,
  variant = 'ghost',
  right = '0',
  size = '1',
  skipFetch,
}: Props) {
  const {
    skylink,
    skylinkBase32,
    weblink,
    weblinkPath,
    weblinkSubdomain,
    pin,
  } = useSkylink(rawSkylink, skipFetch)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        as={Button}
        variant={variant}
        size={size}
        css={{
          right,
          position: 'relative',
        }}
      >
        <DotsHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          as="a"
          href={weblink}
          target="_blank"
          css={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          Open weblink
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => pin()}>Pin</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Copy</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => copyToClipboard(weblinkPath, 'path weblink')}
        >
          Path weblink
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            copyToClipboard(weblinkSubdomain, 'subdomain weblink')
          }
        >
          Subdomain weblink
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => copyToClipboard(skylink, 'skylink')}>
          Skylink
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => copyToClipboard(skylinkBase32, 'base 32 skylink')}
        >
          Base 32 skylink
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
