import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  Button,
  ButtonVariant,
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
import { useDomains, copyToClipboard } from '@riftdweb/core'

type Props = {
  domain: Domain
  variant?: ButtonVariant
  right?: string
  size?: '1' | '2'
  onOpenChange?: (val: boolean) => void
}

export function DomainContextMenu({
  domain,
  variant,
  right = '0',
  size = '1',
  onOpenChange,
}: Props) {
  const { removeDomain } = useDomains()
  const { privateKey, publicKey } = genKeyPairFromSeed(domain.id)

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
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
          <DotsHorizontalIcon />
        </Button>
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
