import React from 'react'
import { GlobeIcon } from '@radix-ui/react-icons'
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
import { useDns } from '../contexts/dns'

type Props = {
  skylink: string
  variant?: ButtonVariant
  size?: '1' | '2'
  right?: string
  onOpenChange?: (val: boolean) => void
}

export function SkylinkDnsMenu({
  skylink,
  variant,
  right = '0',
  size = '1',
  onOpenChange,
}: Props) {
  const { dns, updateDnsEntry } = useDns()
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <Tooltip content="Update DNS record">
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            ghost={!variant}
            size={size}
            css={{
              right,
              position: 'relative',
            }}
          >
            <GlobeIcon />
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>DNS</DropdownMenuLabel>
        {dns.data?.entries.map((dnsEntry) => (
          <DropdownMenuItem
            key={dnsEntry.id}
            onSelect={() =>
              updateDnsEntry(dnsEntry.id, {
                dataLink: skylink,
              })
            }
          >
            {dnsEntry.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
