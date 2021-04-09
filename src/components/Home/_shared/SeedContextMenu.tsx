import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@modulz/design-system'
import { useSeeds } from '../../../hooks/useSeeds'
import { Seed } from '../../../shared/types'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { genKeyPairFromSeed } from 'skynet-js'
import { copyToClipboard } from '../../../shared/clipboard'

type Props = {
  seed: Seed
  variant?: string
  right?: string
  size?: string
}

export function SeedContextMenu({
  seed,
  variant = 'ghost',
  right = '0',
  size = '1',
}: Props) {
  const { removeSeed } = useSeeds()
  const { privateKey, publicKey } = genKeyPairFromSeed(seed.id)

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
        <DropdownMenuItem onSelect={() => removeSeed(seed.id, true)}>
          Remove
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Copy</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => copyToClipboard(seed.id, 'seed')}>
          Seed
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => copyToClipboard(seed.parentSeed, 'parent seed')}
          disabled={!seed.parentSeed}
        >
          Parent seed
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => copyToClipboard(seed.childSeed, 'child seed')}
          disabled={!seed.childSeed}
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
