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
import { Domain } from '@riftdweb/types'
import { Fragment } from 'react'
import { genKeyPairFromSeed } from 'skynet-js'
import { useDomains } from '@riftdweb/core/src/contexts/domains'
import { copyToClipboard } from '@riftdweb/core/src/shared/clipboard'

type Props = {
  domain: Domain
  variant?: ButtonVariants['variant']
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
