import { LayoutIcon } from '@radix-ui/react-icons'
import { Box, Flex, Heading, Paragraph } from '@riftdweb/design-system'
import { Link } from '../_shared/Link'

export function DeveloperTools() {
  return (
    <Box css={{ marginTop: '$9' }}>
      <Flex css={{ flexDirection: 'column', gap: '$2' }}>
        <Heading
          css={{
            borderBottom: '1px solid $gray300',
            paddingBottom: '$2',
            marginBottom: '$2',
          }}
        >
          Developer tools
        </Heading>
        <Flex css={{ flexDirection: 'column', gap: '$4' }}>
          <Paragraph css={{ color: '$gray900', fontSize: '$3' }}>
            The Task and Indexing Manager tools provide visibility into the
            scheduling, processing, and prioritization of background tasks.
            Because Rift is fully decentralized, the application continuously
            indexes and processes data from peers to keep information as current
            as possible.
          </Paragraph>
          <Flex css={{ gap: '$1' }}>
            <Link to="/dev/task-manager" as="button" variant="gray">
              <Box css={{ mr: '$1' }}>
                <LayoutIcon />
              </Box>
              Task Manager
            </Link>
            <Link to="/dev/indexing-manager" as="button" variant="gray">
              <Box css={{ mr: '$1' }}>
                <LayoutIcon />
              </Box>
              Indexing Manager
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}
