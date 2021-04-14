import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@modulz/design-system'
import { useDomains } from '../../../hooks/domains'
import { Domain } from '../../../shared/types'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { genKeyPairFromSeed } from 'skynet-js'
import { copyToClipboard } from '../../../shared/clipboard'

type Props = {
  domain: Domain
  variant?: string
  right?: string
  size?: string
}

export function DomainContextMenu({
  domain,
  variant = 'ghost',
  right = '0',
  size = '1',
}: Props) {
  const { removeDomain } = useDomains()
  const { privateKey, publicKey } = genKeyPairFromSeed(domain.id)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        as={Button}
        variant={variant as any}
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
        <DropdownMenuItem onSelect={() => removeDomain(domain.id, true)}>
          Remove
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Copy</DropdownMenuLabel>
        {/* TODO maybe this should be a separate field domain.seed */}
        <DropdownMenuItem
          onSelect={() => copyToClipboard(domain.id, 'domain ID')}
        >
          Seed
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => copyToClipboard(domain.parentSeed, 'parent seed')}
          disabled={!domain.parentSeed}
        >
          Parent seed
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => copyToClipboard(domain.childSeed, 'child seed')}
          disabled={!domain.childSeed}
        >
          Child seed
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => copyToClipboard(privateKey, 'private key')}
        >
          Private key
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => copyToClipboard(publicKey, 'public key')}
        >
          Public key
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
