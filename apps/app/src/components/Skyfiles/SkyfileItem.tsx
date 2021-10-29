import {
  ClipboardIcon,
  ExclamationTriangleIcon,
  ExternalLinkIcon,
  FileIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from '@radix-ui/react-icons'
import { Box, Button, Flex, Link, Text, Tooltip } from '@riftdweb/design-system'
import { Skyfile } from '@riftdweb/types'
import bytes from 'bytes'
import { formatDistance, parseISO } from 'date-fns'
import { useMemo, useState } from 'react'
import {
  useSkylink,
  copyToClipboard,
  getSize,
  FolderIcon,
  SpinnerIcon,
  SkylinkDnsMenu,
  SkylinkPeek,
} from '@riftdweb/core'

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
  removeSkyfile: (id: string) => void
}

export function SkyfileItem({ skyfile, setFilterValue, removeSkyfile }: Props) {
  const {
    id,
    metadata,
    skylink: rawSkylink,
    isDirectory,
    upload: { uploadedAt, ingressPortals, status, progress, error },
  } = skyfile
  const portal = ingressPortals.length ? ingressPortals[0] : ''
  const [isHovering, setIsHovering] = useState<boolean>(false)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

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
  }, [status, isDirectory])

  const { skylink, weblink } = useSkylink(rawSkylink, true)

  const size = useMemo(() => {
    return bytes(getSize(skyfile), {
      unitSeparator: ' ',
      decimalPlaces: '1',
    })
  }, [skyfile])

  return (
    <Box
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => !isMenuOpen && setIsHovering(false)}
      css={{
        position: 'relative',
        height: '40px',
        borderBottom: '1px solid $gray4',
        '&:last-of-type': {
          borderBottom: 'none',
        },
        '&:hover': {
          backgroundColor: '$gray2',
        },
      }}
    >
      <Flex
        css={{
          width: '100%',
          height: '100%',
          padding: '0 $3',
          position: 'absolute',
          alignItems: 'center',
          gap: '$1',
        }}
      >
        <Box css={{ color: '$gray11', position: 'relative', top: '1px' }}>
          {iconElement}
        </Box>
        <Box css={{ flex: 2, overflow: 'hidden' }}>
          <Text
            size="3"
            css={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '24px',
              whiteSpace: 'nowrap',
            }}
          >
            <Link
              target="_blank"
              css={{ outline: 'none', textDecoration: 'none' }}
              href={weblink}
            >
              {metadata.filename}
            </Link>
          </Text>
        </Box>
        <Box
          css={{
            flex: 1,
            display: 'none',
            '@bp1': {
              display: 'flex',
            },
            position: 'relative',
            top: '1px',
          }}
        >
          {skylink && <SkylinkPeek skylink={skylink} />}
        </Box>
        <Box
          css={{
            flex: 1,
            display: 'none',
            '@bp1': {
              display: 'block',
            },
          }}
        >
          <Text css={{ color: '$gray11', lineHeight: '24px' }}>{size}</Text>
        </Box>
        <Box
          css={{
            flex: 1,
            display: 'none',
            '@bp2': {
              display: 'block',
            },
          }}
        >
          {portal && (
            <Text css={{ color: '$gray10', lineHeight: '24px' }}>{portal}</Text>
          )}
        </Box>
        {status === 'complete' ? (
          <Box
            css={{
              flex: 1,
            }}
          >
            <Text
              css={{
                color: '$gray11',
                textAlign: 'right',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '24px',
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
          <Box css={{ color: '$gray11', flex: 1, textAlign: 'right' }}>
            {status === 'uploading' && getProgressText(progress)}
            {status === 'processing' && 'Processing...'}
            {status === 'error' && (
              <Tooltip content={error}>
                <Link css={{ color: '$red10', textAlign: 'right' }}>
                  {'Upload failed'}
                </Link>
              </Tooltip>
            )}
          </Box>
        )}
      </Flex>
      {status === 'complete' && (
        <Flex
          css={{
            position: 'relative',
            backgroundColor: '$gray2',
            visibility: isHovering ? 'inherit' : 'hidden',
            alignItems: 'center',
            float: 'right',
            height: '100%',
            padding: '0 $1',
          }}
        >
          <Tooltip content="Filter by name">
            <Button onClick={() => setFilterValue(metadata.filename)} ghost>
              <MagnifyingGlassIcon />
            </Button>
          </Tooltip>
          <SkylinkDnsMenu
            skylink={skylink}
            onOpenChange={(val) => {
              setIsMenuOpen(val)
              setIsHovering(val)
            }}
          />
          <Tooltip content="Open weblink">
            <Button ghost as="a" href={weblink} target="_blank">
              <ExternalLinkIcon />
            </Button>
          </Tooltip>
          <Tooltip content="Copy weblink">
            <Button ghost onClick={() => copyToClipboard(weblink, 'weblink')}>
              <ClipboardIcon />
            </Button>
          </Tooltip>
          <Tooltip content="Delete">
            <Button ghost onClick={() => removeSkyfile(id)}>
              <TrashIcon />
            </Button>
          </Tooltip>
        </Flex>
      )}
    </Box>
  )
}

// <Text css={{ color: '$red10', textAlign: 'right' }}>
//   {error || 'Upload failed.'}
// </Text>
