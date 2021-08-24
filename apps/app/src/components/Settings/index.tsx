import { Container } from '@riftdweb/design-system'
import { LocalSeed } from './LocalSeed'
import { MySky } from './MySky'
import { DeveloperTools } from './DeveloperTools'

export function Settings() {
  return (
    <Container size="3" css={{ py: '$3', flexDirection: 'column', gap: '$3' }}>
      <MySky />
      <LocalSeed />
      <DeveloperTools />
    </Container>
  )
}
