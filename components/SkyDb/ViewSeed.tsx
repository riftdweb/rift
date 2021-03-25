import { Box, Text } from '@modulz/design-system'
import { Nav } from './Nav'
import { useRouter } from 'next/router'
import { AddKey } from './AddKey'
import { useSeedKeys } from '../../hooks/useSeedKeys'
import { KeysPanel } from './KeysPanel'

export default function SkyDbViewSeed() {
  const { query } = useRouter()
  const seed = query.seed as string
  const [keys, _setKey, removeKey] = useSeedKeys(seed)

  if (!seed) {
    return <Box>404</Box>
  }

  return (
    <Box css={{ py: '$3' }}>
      <Nav seed={seed} />
      <Box css={{ my: '$3' }}>
        <AddKey seed={seed} />
        <KeysPanel
          seed={seed}
          keys={keys} />
      </Box>
    </Box>
  )
}
