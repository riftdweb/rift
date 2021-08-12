import { Box, Flex, Panel } from '@riftdweb/design-system'
import { parseSkylink } from 'skynet-js'
import { ScrollArea } from '../_shared/ScrollArea'
import { SkylinkResults } from './SkylinkResults'
import { UserResults } from './UserResults'

export function SearchResults({ searchValue, onSelect }) {
  const isSkylink = searchValue && !!parseSkylink(searchValue)

  const showSkylinkResults = !searchValue || isSkylink
  const showUserResults = !isSkylink

  return (
    <Panel
      css={{
        position: 'absolute',
        zIndex: 6,
        width: '100%',
        maxHeight: '80vh',
        display: 'flex',
        overflow: 'hidden',
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        border: '1px solid $gray500',
      }}
    >
      <Box css={{ width: '100%' }}>
        <ScrollArea>
          <Box>
            <Flex css={{ flexDirection: 'column', gap: '$1', padding: '$2 0' }}>
              {showSkylinkResults && (
                <SkylinkResults searchValue={searchValue} />
              )}
              {showSkylinkResults && showUserResults && (
                <Box
                  css={{
                    marginBottom: '$1',
                    borderBottom: '1px solid $gray400',
                  }}
                />
              )}
              {showUserResults && (
                <UserResults searchValue={searchValue} onSelect={onSelect} />
              )}
            </Flex>
          </Box>
        </ScrollArea>
      </Box>
    </Panel>
  )
}
