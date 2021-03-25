import { Flex, Text, Heading, Tooltip, Button, Box } from '@modulz/design-system'
import { TrashIcon } from '@radix-ui/react-icons'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useSeeds } from '../../hooks/useSeeds'
import { Link } from '../_shared/Link'

type Props = {
  seed?: string
}

export function Nav({ seed }: Props) {
  const { push } = useRouter()
  const [_seeds, _addSeed, removeSeed] = useSeeds()

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
          <Tooltip content={seed}>
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
          </Tooltip>
        )}
        {!seed && <Box css={{ flex: 1 }} />}
        {seed && (
          <Tooltip content="Remove seed">
            <Button onClick={removeSeedAndNav}><TrashIcon /></Button>
          </Tooltip>
        )}
      </Flex>
    </Heading>
  )
}
