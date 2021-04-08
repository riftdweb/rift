import { Box, Subheading, Text } from '@modulz/design-system'
import { useRouter } from 'next/router'
import { AddKey } from './AddKey'
import { KeysPanel } from './KeysPanel'
import { Nav } from '../_shared/Nav'
import { useSeeds } from '../../../hooks/useSeeds'

export default function SeedManager() {
  const { query } = useRouter()
  const seedName = query.seedName as string
  const { seeds, isValidating } = useSeeds()
  const seed = seeds.find((seed) => seed.name === seedName)

  if (!seed && isValidating) {
    return null
  }

  if (!isValidating && !seed) {
    return <Box>404</Box>
  }

  return (
    <Box css={{ py: '$3' }}>
      <Nav seed={seed} />
      <Box css={{ my: '$3' }}>
        <AddKey seed={seed} />
        {seed.keys.length ? (
          <KeysPanel seed={seed} />
        ) : (
          <Box css={{ textAlign: 'center', padding: '$3 0' }}>
            <Subheading css={{ margin: '$2 0' }}>
              Manage and edit SkyDB data keys
            </Subheading>
            <Text css={{ color: '$gray900' }}>
              Add a data key above to get started! Adding an existing data key
              will bring up the current value.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}
