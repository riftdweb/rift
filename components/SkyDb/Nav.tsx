import { Box, Button, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger, Flex, Heading, Text } from '@modulz/design-system'
import { GearIcon } from '@radix-ui/react-icons'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useSeeds } from '../../hooks/useSeeds'
import { Link } from '../_shared/Link'

type Props = {
  seed?: string
}

export function Nav({ seed }: Props) {
  const { push } = useRouter()
  const { removeSeed } = useSeeds()

  const removeSeedAndNav = useCallback(() => {
    if (!seed) {
      return
    }
    removeSeed(seed)
    push('/skydb')
  }, [seed, removeSeed, push])

  return (
    <Heading css={{ my: '$5' }}>
      <Flex css={{ gap: '$1', alignItems: 'center' }}>
        <Link href="/skydb">Seeds</Link>
        {seed && <Text>/</Text>}
        {seed && (
          <Link
            css={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            href={`/skydb/${seed}`}>
            {seed}
          </Link>
        )}
        {!seed && <Box css={{ flex: 1 }} />}
        {seed && (
          <DropdownMenu>
            <DropdownMenuTrigger as={Button}>
              <GearIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem as="button" onClick={removeSeedAndNav}>
                  Delete Seed
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </Flex>
    </Heading>
  )
}
