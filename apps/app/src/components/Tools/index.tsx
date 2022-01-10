import { db } from '@riftdweb/core/src/services/rx'
import {
  getAccount,
  login,
  logout,
} from '@riftdweb/core/src/services/rx/services/account'
import { Button, Flex, Text } from '@riftdweb/design-system'
import { useObservableState } from 'observable-hooks'
import { map } from 'rxjs'

export function Tools() {
  const account = useObservableState(
    getAccount().$.pipe(map((v) => v.toJSON()))
  )

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
