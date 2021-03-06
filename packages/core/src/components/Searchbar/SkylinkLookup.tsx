import React from 'react'
import { Flex, Text } from '@riftdweb/design-system'
import { SkylinkInfo } from '../SkylinkInfo'

export function SkylinkLookup({ searchValue }) {
  return (
    <Flex css={{ flexDirection: 'column', gap: '$2', padding: '$1 $3 $2 $3' }}>
      <Text
        css={{
          color: '$gray11',
          fontWeight: '600',
          flex: 1,
        }}
      >
        Skylink
      </Text>
      {!searchValue ? (
        <Text css={{ color: '$gray10' }}>
          Enter a skylink to view file details.
        </Text>
      ) : (
        <SkylinkInfo skylink={searchValue} />
      )}
    </Flex>
  )
}
