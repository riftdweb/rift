import { Box, Flex, Heading, Text } from '@modulz/design-system'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useSeeds } from '../../../hooks/useSeeds'
import { Seed } from '../../../shared/types'
import { Link } from '../../_shared/Link'
import { SeedContextMenu } from './SeedContextMenu'
import { AddSeed } from './AddSeed'

type Props = {
  seed?: Seed
}

export function Nav({ seed }: Props) {
  const { push } = useRouter()
  const { removeSeed } = useSeeds()

  const removeSeedAndNav = useCallback(() => {
    if (!seed) {
      return
    }
    removeSeed(seed.id)
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
              whiteSpace: 'nowrap',
            }}
            href={`/skydb/${seed.name}`}
          >
            {seed.name}
          </Link>
        )}
        {!seed && <Box css={{ flex: 1 }} />}
        {!seed && <AddSeed />}
        {seed && <SeedContextMenu seed={seed} variant="gray" size="2" />}
      </Flex>
    </Heading>
  )
}
