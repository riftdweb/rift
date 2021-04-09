import { Box, Button, Flex, Link, Text, Tooltip } from '@modulz/design-system'
import {
  ClipboardIcon,
  ExclamationTriangleIcon,
  ExternalLinkIcon,
  FileIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons'
import bytes from 'bytes'
import { formatDistance, parseISO } from 'date-fns'
import React, { useMemo, useRef, useState } from 'react'
import { useSkylink } from '../../hooks/useSkylink'
import { copyToClipboard } from '../../shared/clipboard'
import { Skyfile } from '../../shared/types'
import { getSize } from '../../shared/uploads'
import FolderIcon from '../_icons/FolderIcon'
import SpinnerIcon from '../_icons/SpinnerIcon'

const getProgressText = (progress) => {
  if (progress === -1) {
    return 'Waiting...'
  } else if (progress > 0) {
    return `Uploading ${Math.round(progress * 100)}%`
  }
  return 'Uploading...'
}

type Props = {
  skyfile: Skyfile
  setFilterValue: (value: string) => void
}

export function SkyfileItem({ skyfile, setFilterValue }: Props) {
  const {
    metadata,
    skylink: rawSkylink,
    isDirectory,
    upload: { uploadedAt, ingressPortals, status, progress, error },
  } = skyfile
  const portal = ingressPortals.length ? ingressPortals[0] : ''
  const [isHovering, setIsHovering] = useState<boolean>(false)

  const iconElement = useMemo(() => {
    if (status === 'complete') {
      return isDirectory ? <FolderIcon /> : <FileIcon />
    }
    if (status === 'uploading' || status === 'processing') {
      return <SpinnerIcon />
    } else if (status === 'error') {
      return <ExclamationTriangleIcon />
    } else {
      return null
    }
  }, [status])

  const { skylink, weblink } = useSkylink(rawSkylink, true)

  const size = useMemo(() => {
    return bytes(getSize(skyfile), {
      unitSeparator: ' ',
      decimalPlaces: '1',
    })
  }, [skyfile])

  const menuRef = useRef()

  return (
    <Flex
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      css={{
        position: 'relative',
        borderBottom: '1px solid $gray300',
        '&:last-of-type': {
          borderBottom: 'none',
        },
        alignItems: 'center',
        gap: '$1',
        padding: '$2 $3',
        '&:hover': {
          backgroundColor: '$gray100',
        },
      }}
    >
      <Box css={{ color: '$gray900' }}>{iconElement}</Box>
      <Box css={{ flex: 2, overflow: 'hidden' }}>
        <Text
          size="3"
          css={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          <Link target="_blank" css={{ outline: 'none' }} href={weblink}>
            {metadata.filename}
          </Link>
        </Text>
      </Box>
      <Box
        css={{
          flex: 1,
          display: 'none',
          when: {
            bp1: {
              display: 'block',
            },
          },
        }}
      >
        {skylink && (
          <Tooltip align="start" content="Copy skylink">
            <Text
              size="2"
              onClick={() => copyToClipboard(skylink, 'skylink')}
              css={{
                color: '$gray900',
                background: 'none',
                fontFamily: '$mono',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {skylink.slice(0, 10)}...
            </Text>
          </Tooltip>
        )}
      </Box>
      <Box
        css={{
          flex: 1,
          display: 'none',
          when: {
            bp1: {
              display: 'block',
            },
          },
        }}
      >
        <Text css={{ color: '$gray900' }}>{size}</Text>
      </Box>
      <Box
        css={{
          flex: 1,
          display: 'none',
          when: {
            bp2: {
              display: 'block',
            },
          },
        }}
      >
        {portal && <Text css={{ color: '$gray800' }}>{portal}</Text>}
      </Box>
      {status === 'complete' ? (
        <Box
          css={{
            flex: 1,
            color: '$gray700',
          }}
        >
          <Text
            css={{
              color: '$gray900',
              textAlign: 'right',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {uploadedAt &&
              formatDistance(parseISO(uploadedAt), new Date(), {
                addSuffix: true,
              })}
          </Text>
        </Box>
      ) : (
        <Box css={{ color: '$gray900', flex: 1, textAlign: 'right' }}>
          {status === 'uploading' && getProgressText(progress)}
          {status === 'processing' && 'Processing...'}
          {status === 'error' && (
            <Tooltip content={error}>
              <Link css={{ color: '$red900', textAlign: 'right' }}>
                {'Upload failed'}
              </Link>
            </Tooltip>
          )}
        </Box>
      )}
      {status === 'complete' && (
        <Flex
          ref={menuRef}
          css={{
            position: 'absolute',
            right: '10px',
            height: '100%',
            backgroundColor: '$gray100',
            display: isHovering ? 'flex' : 'none',
            alignItems: 'center',
            paddingLeft: '100px',
          }}
        >
          <Tooltip content="Filter by name">
            <Button
              onClick={() => setFilterValue(metadata.filename)}
              variant="ghost"
            >
              <MagnifyingGlassIcon />
            </Button>
          </Tooltip>
          <Tooltip content="Open weblink">
            <Button variant="ghost" as="a" href={weblink} target="_blank">
              <ExternalLinkIcon />
            </Button>
          </Tooltip>
          <Tooltip content="Copy weblink">
            <Button
              variant="ghost"
              onClick={() => copyToClipboard(weblink, 'weblink')}
            >
              <ClipboardIcon />
            </Button>
          </Tooltip>
        </Flex>
      )}
    </Flex>
  )
}

// <Text css={{ color: '$red900', textAlign: 'right' }}>
//   {error || 'Upload failed.'}
// </Text>
