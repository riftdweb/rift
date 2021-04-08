import { Flex } from '@modulz/design-system'
import { Formatter } from './Formatter'
import { MnemonicToHex } from './MnemonicToHex'

export function Tools() {
  return (
    <Flex css={{ py: '$3', flexDirection: 'column', gap: '$3' }}>
      <Formatter />
      <MnemonicToHex />
    </Flex>
  )
}
