import { Container, Box, Flex } from '@riftdweb/design-system'
import { FileNav } from './FileNav'

export function Layout({ children }) {
  return (
    <Container size="3" css={{ py: '$5' }}>
      <FileNav />
      <Box
        css={{
          position: 'relative',
          margin: '$3 0',
          border: '1px solid $gray6',
          backgroundColor: '$panel',
          borderRadius: '$3',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Container>
  )
}
