import React from 'react'
import { DismissableLayer } from '@radix-ui/react-dismissable-layer'
import { Cross1Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Box, Button, ControlGroup, TextField } from '@riftdweb/design-system'
import { useSearch } from '../../contexts/search'
import { SearchResults } from './SearchResults'

export function Searchbar() {
  const {
    ref,
    searchValue,
    setSearchValue,
    isFocused,
    isOpen,
    setIsFocused,
    onChange,
  } = useSearch()

  return (
    <Box
      css={{
        zIndex: 2,
        position: 'relative',
        transform: 'translate3d(0, 0, 0)',
        width: isOpen ? '100%' : '210px',
        '@bp2': {
          width: isOpen ? '600px' : '210px',
        },
        transition: 'width 0.1s ease-in-out',
      }}
    >
      <ControlGroup>
        <Button
          disabled
          css={{
            borderTopLeftRadius: '$2',
            borderBottomLeftRadius: isFocused ? '0' : '$2',
            borderTopRightRadius: '0',
            borderBottomRightRadius: '0',
          }}
        >
          <MagnifyingGlassIcon />
        </Button>
        <TextField
          ref={ref}
          value={searchValue}
          onChange={onChange}
          spellCheck={false}
          onFocus={() => setIsFocused(true)}
          css={{ padding: '0 $2' }}
          placeholder="Search users or skylinks"
          size="3"
        />
        {searchValue && (
          <Button
            onClick={() => setSearchValue('')}
            css={{
              borderTopLeftRadius: '0',
              borderBottomLeftRadius: '0',
              borderTopRightRadius: '$2',
              borderBottomRightRadius: isFocused ? '0' : '$2',
            }}
          >
            <Cross1Icon />
          </Button>
        )}
      </ControlGroup>
      {isFocused && (
        <DismissableLayer onDismiss={() => setIsFocused(false)}>
          {(props) => (
            <Box {...props}>
              <SearchResults
                searchValue={searchValue}
                onSelect={() => setIsFocused(false)}
              />
            </Box>
          )}
        </DismissableLayer>
      )}
    </Box>
  )
}
