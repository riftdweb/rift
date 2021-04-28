import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Tooltip,
} from '@riftdweb/design-system'
import { GlobeIcon } from '@radix-ui/react-icons'
import { useDns } from '../../hooks/useDns'

type Props = {
  skylink: string
  variant?: string
  size?: string
  right?: string
  onOpenChange?: (val: boolean) => void
}

export function SkylinkDnsMenu({
  skylink,
  variant = 'ghost',
  right = '0',
  size = '1',
  onOpenChange,
}: Props) {
  const { dnsEntries, updateDnsEntry } = useDns()
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <Tooltip content="Update DNS entry">
        <DropdownMenuTrigger
          as={Button}
          variant={variant as any}
          size={size}
          css={{
            right,
            position: 'relative',
          }}
        >
          <GlobeIcon />
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>DNS Entries</DropdownMenuLabel>
        {dnsEntries.map((dnsEntry) => (
          <DropdownMenuItem
            onSelect={() =>
              updateDnsEntry(dnsEntry.id, {
                skylink,
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
