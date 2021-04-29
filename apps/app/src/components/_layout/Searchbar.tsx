import { DismissableLayer } from '@radix-ui/react-dismissable-layer'
import { Cross1Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Box, Button, ControlGroup, Input } from '@riftdweb/design-system'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SearchResults } from './SearchResults'

export function Searchbar() {
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const [value, setValue] = useState<string>('')
  const ref = useRef()

  const onChange = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setValue(e.target.value)
    },
    [setValue]
  )

  useEffect(() => {
    if (value) {
      if (!isFocused) {
        setIsFocused(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const width = value ? '500px' : '200px'

  const isOpen = isFocused && value

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
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            css={{ padding: '0 $2' }}
            placeholder="Look up a Skylink"
            size="2"
          />
          {value && (
            <Button
              onClick={() => setValue('')}
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
        {value && isFocused && (
          <DismissableLayer onDismiss={() => setIsFocused(false)}>
            {(props) => (
              <Box {...props}>
                <SearchResults value={value} />
              </Box>
            )}
          </DismissableLayer>
        )}
      </Box>
    </Box>
  )
}
