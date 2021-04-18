import { Button, Flex, Box, Panel, Text } from '@modulz/design-system'
import { useMemo } from 'react'
import bytes from 'bytes'
import {
  ExternalLinkIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons'
import { useSkylink } from '../../hooks/useSkylink'
import { SkylinkContextMenu } from '../_shared/SkylinkContextMenu'
import SpinnerIcon from '../_icons/SpinnerIcon'
import { Link } from '../_shared/Link'

export function SearchResults({ value }) {
  const { skylink, data, isApp, isValidating, weblink } = useSkylink(value)

  const size = useMemo(() => {
    if (!data) {
      return
    }
    return bytes(data.metadata.length, {
      unitSeparator: ' ',
      decimalPlaces: '1',
    })
  }, [data])

  const fileCount = useMemo(() => {
    if (!data) {
      return
    }
    return Object.keys(data.metadata.subfiles).length
  }, [data])

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
        {value && !skylink && (
          <Flex css={{ gap: '$2', alignItems: 'center', color: '$gray900' }}>
            <ExclamationTriangleIcon />
            <Text
              css={{ color: '$gray900', top: '-1px', position: 'relative' }}
            >
              Invalid Skylink
            </Text>
          </Flex>
        )}
        {skylink &&
          (data ? (
            <Flex css={{ flexDirection: 'column', gap: '$1' }}>
              <Flex css={{ alignItems: 'center' }}>
                <Link
                  href={weblink}
                  target="_blank"
                  css={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {data.metadata.filename}
                </Link>
                <Flex css={{ marginRight: '-10px' }}>
                  <Button as="a" variant="ghost" href={weblink} target="_blank">
                    <ExternalLinkIcon />
                  </Button>
                  <SkylinkContextMenu skylink={skylink} />
                </Flex>
              </Flex>
              <Flex css={{ gap: '$1' }}>
                <Text
                  size="1"
                  css={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: '$gray800',
                  }}
                >
                  {fileCount > 1
                    ? `${isApp ? 'App' : 'Directory'} with ${fileCount} files`
                    : 'File'}
                </Text>
                <Text size="1" css={{ color: '$gray800' }}>
                  {data.contentType}
                </Text>
                <Text size="1" css={{ color: '$gray800' }}>
                  •
                </Text>
                <Text size="1" css={{ color: '$gray800' }}>
                  {size}
                </Text>
              </Flex>
            </Flex>
          ) : isValidating ? (
            <Box css={{ color: '$gray900' }}>
              <SpinnerIcon />
            </Box>
          ) : (
            <Box>Error</Box>
          ))}
      </Flex>
    </Panel>
  )
}
