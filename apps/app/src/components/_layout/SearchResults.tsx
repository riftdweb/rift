import { Flex, Panel } from '@riftdweb/design-system'
import { SkylinkInfo } from '../_shared/SkylinkInfo'

export function SearchResults({ value }) {
  return (
    <Panel
      css={{
        position: 'absolute',
        zIndex: 2,
        width: '100%',
        padding: '$3',
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        border: '1px solid $gray500',
      }}
    >
      <Flex css={{ flexDirection: 'column', gap: '$1' }}>
        <SkylinkInfo skylink={value} />
      </Flex>
    </Panel>
  )
}
