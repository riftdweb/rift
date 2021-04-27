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
import { Fragment } from 'react'

type Props = {
  domain: Domain
  variant?: string
  right?: string
  size?: string
  onOpenChange?: (val: boolean) => void
}

export function DomainContextMenu({
  domain,
  variant = 'ghost',
  right = '0',
  size = '1',
  onOpenChange,
}: Props) {
  const { removeDomain } = useDomains()
  const { privateKey, publicKey } = genKeyPairFromSeed(domain.id)

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
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
        {domain.seed ? (
          <Fragment>
            <DropdownMenuItem
              onSelect={() => copyToClipboard(domain.seed, 'seed')}
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
          </Fragment>
        ) : (
          <DropdownMenuItem
            onSelect={() => copyToClipboard(domain.id, 'domain ID')}
          >
            Domain name
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
