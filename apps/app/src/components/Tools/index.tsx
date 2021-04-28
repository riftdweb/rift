import { Flex } from '@riftdweb/design-system'
import { Formatter } from './Formatter'
import { MnemonicToHex } from './MnemonicToHex'
import { MySkyLearn } from './MySkyLearn'

export function Tools() {
  return (
    <Flex css={{ py: '$3', flexDirection: 'column', gap: '$3' }}>
      {/* <Formatter />
      <MnemonicToHex /> */}
      <MySkyLearn />
    </Flex>
  )
}
