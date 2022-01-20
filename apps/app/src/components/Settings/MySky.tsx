import {
  Box,
  Button,
  Flex,
  Heading,
  Paragraph,
  Tooltip,
} from '@riftdweb/design-system'
import { MySkyLoggedIn } from './MySkyLoggedIn'
import { useAccount } from '@riftdweb/core/src/hooks/useAccount'
import { login } from '@riftdweb/core/src/services/account'

export function MySky() {
  const { myUserId } = useAccount()

  if (myUserId) {
    return <MySkyLoggedIn />
  }

  return (
    <Box css={{ margin: '$3 0' }}>
      <Flex css={{ flexDirection: 'column', gap: '$2' }}>
        <Heading
          css={{
            borderBottom: '1px solid $gray4',
            paddingBottom: '$2',
            marginBottom: '$2',
          }}
        >
          MySky
        </Heading>
        <Flex css={{ gap: '$1', alignItems: 'center', marginTop: '$2' }}>
          <Paragraph css={{ color: '$gray11', fontSize: '$3' }}>
            Currently not logged in to a MySky identity.
          </Paragraph>
          <Box css={{ flex: 1 }} />
          <Tooltip content="Log in to MySky">
            <Button onClick={() => login()}>
              Log in or create a new MySky identity
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  )
}
