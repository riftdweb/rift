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
          Developer tools (for nerds)
        </Heading>
        <Flex css={{ flexDirection: 'column', gap: '$4' }}>
          <Paragraph css={{ color: '$gray900', fontSize: '$3' }}>
            The Task Manager provides visibility into the scheduling,
            processing, and prioritization status of background tasks. Because
            Rift is fully-decentralized, the application is constantly
            interacting with data from peer and running indexing processes to
            keep data as current as possible.
          </Paragraph>
          <Box>
            <Link to="/dev" as="button" variant="gray">
              <Box css={{ mr: '$1' }}>
                <LayoutIcon />
              </Box>
              Task Manager
            </Link>
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}
