import { Container, Box, Flex } from '@riftdweb/design-system'
import { FileNav } from './FileNav'

export function Layout({ children }) {
  return (
    <Container size="3" css={{ py: '$5' }}>
      <Flex css={{ flexDirection: 'column', gap: '$5' }}>
        <Box>
          <FileNav />
          <Box
            css={{
              position: 'relative',
              margin: '$3 0',
              border: '1px solid $gray500',
              backgroundColor: '$panel',
              borderRadius: '$3',
              // overflow: 'hidden',
            }}
          >
            {children}
          </Box>
        </Box>
      </Flex>
    </Container>
  )
}
