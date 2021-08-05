import { DismissableLayer } from '@radix-ui/react-dismissable-layer'
import { Cross1Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Box, Button, ControlGroup, Input } from '@riftdweb/design-system'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SearchResults } from './SearchResults'

export function Searchbar() {
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const ref = useRef()

  const onChange = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setSearchValue(e.target.value)
    },
    [setSearchValue]
  )

  useEffect(() => {
    if (searchValue) {
      if (!isFocused) {
        setIsFocused(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  const width = isFocused || searchValue ? '500px' : '210px'

  const isOpen = isFocused && searchValue

  return (
    <Box
      css={{
        flex: 1,
        width: '100%',
      }}
    >
      <Box
        css={{
          position: 'relative',
          margin: '0 $3 0 $3',
          maxWidth: width,
          transition: 'max-width 0.2s ease-in-out',
        }}
      >
        <ControlGroup>
          <Button
            disabled
            css={{
              borderTopLeftRadius: '$2',
              borderBottomLeftRadius: isOpen ? '0' : '$2',
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
                borderBottomRightRadius: isOpen ? '0' : '$2',
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
                <SearchResults searchValue={searchValue} />
              </Box>
            )}
          </DismissableLayer>
        )}
      </Box>
    </Box>
  )
}
