import { Box, Subheading, Text } from '@modulz/design-system'
import { useRouter } from 'next/router'
import { useSeedKeys } from '../../hooks/useSeedKeys'
import { AddKey } from './AddKey'
import { KeysPanel } from './KeysPanel'
import { Nav } from './Nav'

export default function SkyDbViewSeed() {
  const { query } = useRouter()
  const seed = query.seed as string
  const { keys } = useSeedKeys(seed)

  if (!seed) {
    return <Box>404</Box>
  }

  return (
    <Box css={{ py: '$3' }}>
      <Nav seed={seed} />
      <Box css={{ my: '$3' }}>
        <AddKey seed={seed} />
        {keys.length ? (
          <KeysPanel seed={seed} keys={keys} />
        ) : (
          <Box css={{ textAlign: 'center', padding: '$3 0' }}>
            <Subheading css={{ margin: '$2 0' }}>
              Add a data key above to open the editor.
            </Subheading>
            <Text css={{ color: '$gray900' }}>
              Adding an existing data key will bring up its current value.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}
