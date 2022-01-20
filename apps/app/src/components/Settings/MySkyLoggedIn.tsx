import { ClipboardIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Tooltip,
} from '@riftdweb/design-system'
import { copyToClipboard, User } from '@riftdweb/core'
import { useAccount } from '@riftdweb/core/src/hooks/useAccount'
import { logout } from '@riftdweb/core/src/services/account'

export function MySkyLoggedIn() {
  const { myUserId } = useAccount()

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
        <Flex css={{ alignItems: 'center', gap: '$2' }}>
          <Text css={{ color: '$gray11' }}>Currently logged in as</Text>
          <User userId={myUserId} />
        </Flex>
        <Flex css={{ gap: '$1', alignItems: 'center', marginTop: '$2' }}>
          <Tooltip content="Copy user ID to clipboard">
            <Button onClick={() => copyToClipboard(myUserId, 'user ID')}>
              <Box css={{ mr: '$1' }}>
                <ClipboardIcon />
              </Box>
              Copy user ID to clipboard
            </Button>
          </Tooltip>
          <Box css={{ flex: 1 }} />
          <Tooltip content="Log out of MySky">
            <Button variant="red" onClick={() => logout()}>
              Log out
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  )
}
