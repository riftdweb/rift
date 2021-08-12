import { Flex, Text } from '@riftdweb/design-system'
import { SkylinkInfo } from '../_shared/SkylinkInfo'

export function SkylinkResults({ searchValue }) {
  return (
    <Flex css={{ flexDirection: 'column', gap: '$2', padding: '$1 $3 $2 $3' }}>
      <Text
        css={{
          color: '$gray900',
          fontWeight: '600',
          flex: 1,
        }}
      >
        Skylink
      </Text>
      {!searchValue ? (
        <Text css={{ color: '$gray800' }}>
          Enter a skylink to view file details.
        </Text>
      ) : (
        <SkylinkInfo skylink={searchValue} />
      )}
    </Flex>
  )
}
