import React, { useEffect, useState } from 'react'
import { Box, Flex, Panel } from '@riftdweb/design-system'
import { parseSkylink } from 'skynet-js'
import { ScrollArea } from '../ScrollArea'
import { SkylinkLookup } from './SkylinkLookup'
import { UserLookup } from './UserLookup'
import { UserResults } from './UserResults'

type Props = {
  searchValue: string
  onSelect: () => void
}

export function SearchResults({ searchValue, onSelect }: Props) {
  const isSkylink = searchValue && !!parseSkylink(searchValue)
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true)
    }, 0)
  }, [])

  const showUserLookup = searchValue.length === 64
  const showSkylinkLookup = !searchValue || isSkylink
  const showUserResults = !showUserLookup && !isSkylink

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
        border: '1px solid $gray6',
      }}
    >
      <Box css={{ width: '100%' }}>
        <ScrollArea>
          <Box>
            <Flex
              css={{
                flexDirection: 'column',
                gap: '$1',
                padding: '$2 0',
                transform: 'translate3d(0, 0, 0)',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.02s linear',
              }}
            >
              {showSkylinkLookup && <SkylinkLookup searchValue={searchValue} />}
              {showSkylinkLookup && showUserResults && (
                <Box
                  css={{
                    marginBottom: '$1',
                    borderBottom: '1px solid $gray5',
                  }}
                />
              )}
              {showUserLookup && <UserLookup searchValue={searchValue} />}
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
