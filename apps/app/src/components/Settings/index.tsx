import { Flex } from '@riftdweb/design-system'
import { LocalSeed } from './LocalSeed'
import { MySky } from './MySky'

export function Settings() {
  return (
    <Flex css={{ py: '$3', flexDirection: 'column', gap: '$3' }}>
      <MySky />
      <LocalSeed />
    </Flex>
  )
}
