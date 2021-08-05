import {
  Badge,
  Box,
  Flex,
  Panel,
  Text,
  Subtitle,
  Paragraph,
} from '@riftdweb/design-system'
import { intersection } from 'lodash'
import { useMemo } from 'react'
import { parseSkylink } from 'skynet-js'
import { useSkynet } from '../../contexts/skynet'
import { useUsers } from '../../contexts/users'
import { People } from '../_shared/People'
import { SkylinkInfo } from '../_shared/SkylinkInfo'
import { User } from '../_shared/User'

export function SkylinkResults({ searchValue }) {
  const isSkylink = searchValue && !!parseSkylink(searchValue)

  if (!searchValue) {
    return (
      <Flex css={{ flexDirection: 'column', gap: '$2' }}>
        <Text
          css={{
            color: '$gray900',
            fontWeight: '600',
            flex: 1,
          }}
        >
          Skylink
        </Text>
        <Flex css={{ flexDirection: 'column', gap: '$1' }}>
          <Text css={{ color: '$gray900' }}>
            Enter a skylink to view file details.
          </Text>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex css={{ flexDirection: 'column', gap: '$2' }}>
      <Text
        css={{
          color: '$gray900',
          fontWeight: '600',
          flex: 1,
        }}
      >
        Skylink
      </Text>
      <Flex css={{ flexDirection: 'column', gap: '$1' }}>
        <SkylinkInfo skylink={searchValue} />
      </Flex>
    </Flex>
  )
}
