import { useAccount } from '@riftdweb/core/src/hooks/useAccount'
import { login, logout } from '@riftdweb/core/src/services/account'
import { Button, Flex, Text } from '@riftdweb/design-system'

export function Tools() {
  const account = useAccount()

  return (
    <Flex css={{ py: '$3', flexDirection: 'column', gap: '$3' }}>
      <pre>
        <Text as="code">{account && JSON.stringify(account, null, 2)}</Text>
      </pre>
      <Button onClick={() => login()}>login</Button>
      <Button onClick={() => logout()}>logout</Button>
    </Flex>
  )
}
