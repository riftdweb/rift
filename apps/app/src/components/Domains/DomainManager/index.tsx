import { Container } from '@riftdweb/design-system'
import { KeysWorkspace } from './KeysWorkspace'

export function DomainManager() {
  return (
    <Container size="3" css={{ height: '100vh', py: '$3' }}>
      <KeysWorkspace />
    </Container>
  )
}
