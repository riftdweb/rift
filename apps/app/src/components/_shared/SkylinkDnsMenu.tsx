import { GlobeIcon } from '@radix-ui/react-icons'
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
import { useDns } from '../../hooks/useDns'

type Props = {
  skylink: string
  variant?: ButtonVariants['variant']
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
          variant={variant}
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
