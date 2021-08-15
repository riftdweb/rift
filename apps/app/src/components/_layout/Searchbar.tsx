import { DismissableLayer } from '@radix-ui/react-dismissable-layer'
import { Cross1Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Box, Button, ControlGroup, Input } from '@riftdweb/design-system'
import { useSearch } from '../../contexts/search'
import { SearchResults } from './SearchResults'

export function Searchbar() {
  const {
    ref,
    searchValue,
    setSearchValue,
    isFocused,
    setIsFocused,
    onChange,
  } = useSearch()

  return (
    <Box
      css={{
        zIndex: 2,
        position: 'relative',
        transform: 'translate3d(0, 0, 0)',
        width: isFocused ? '100%' : '210px',
        '@bp2': {
          width: isFocused ? '500px' : '210px',
        },
        transition: 'max-width 0.05s ease-in-out',
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
        <Input
          ref={ref}
          value={searchValue}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          css={{ padding: '0 $2' }}
          placeholder="Search users or skylinks"
          size="2"
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
