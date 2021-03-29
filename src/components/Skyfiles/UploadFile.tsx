import { Box, Button, Flex, Link, Text, Tooltip } from '@modulz/design-system'
import {
  ClipboardCopyIcon,
  Cross2Icon,
  ExternalLinkIcon,
  FileIcon,
  TriangleDownIcon,
} from '@radix-ui/react-icons'
import bytes from 'bytes'
import * as clipboard from 'clipboard-polyfill/text'
import { formatDistance, parseISO } from 'date-fns'
import React, { useCallback, useMemo, useState } from 'react'
import { decodeBase64, encodeBase32 } from '../../shared/base'
import FolderIcon from '../_icons/FolderIcon'
import SpinnerIcon from '../_icons/SpinnerIcon'

type DirectoryFile = {
  name: string
  lastModified: number
  path: string
  webkitRelativePath: string
  size: number
  type: string
}

type Props = {
  selectedPortal: string
  file: {
    name: string
    directory?: boolean
    lastModified?: number
    path?: string
    webkitRelativePath?: string
    size?: number
    type?: string
    files?: DirectoryFile[]
  }
  status: string
  url?: string
  uploadedAt: string
  portal?: string
  skylink?: string
  progress?: number
  error?: string
}

export function UploadFile({
  selectedPortal,
  file,
  skylink,
  uploadedAt,
  portal,
  status,
  progress,
  error,
}: Props) {
  const [isHovering, setIsHovering] = useState<boolean>(false)

  const getIcon = () => {
    if (status === 'complete') {
      return file.directory ? <FolderIcon /> : <FileIcon />
    }
    if (status === 'uploading' || status === 'processing') {
      return <SpinnerIcon />
    } else if (status === 'error') {
      return <Cross2Icon />
    } else {
      return null
    }
  }

  const subdomainSkylink = useMemo(() => {
    if (!skylink) {
      return ''
    }
    const value = skylink.replace('sia:', '')
    const decoded = decodeBase64(value)
    const base32 = encodeBase32(decoded)
    return `https://${base32}.${selectedPortal}`
  }, [skylink, selectedPortal])

  const pathSkylink = useMemo(() => {
    if (!skylink) {
      return ''
    }
    const value = skylink.replace('sia:', '')
    return `https://${selectedPortal}/${value}`
  }, [skylink, selectedPortal])

  const copyToClipboard = useCallback(() => {}, [])

  const isApp = useMemo(() => {
    return (
      file.directory &&
      file.files.find((f) => ['index.html', 'index.htm'].includes(f.name))
    )
  }, [file])

  const getProgressText = (progress) => {
    if (progress === -1) {
      return 'Waiting...'
    } else if (progress > 0) {
      return `Uploading ${Math.round(progress * 100)}%`
    }
    return 'Uploading...'
  }

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
      <Box css={{ color: '$gray900' }}>{getIcon()}</Box>
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
          <Link
            target="_blank"
            css={{ outline: 'none' }}
            href={isApp ? subdomainSkylink : pathSkylink}
          >
            {file.name}
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
          <Text size="2" css={{ color: '$gray900', fontFamily: '$mono' }}>
            {skylink.replace('sia:', '').slice(0, 10)}...
          </Text>
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
        {status === 'complete' && (
          <Text css={{ color: '$gray900' }}>
            {bytes(file.size, { unitSeparator: ' ', decimalPlaces: '1' })}
          </Text>
        )}
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
          <Text css={{ color: '$gray900', textAlign: 'right' }}>
            {uploadedAt &&
              formatDistance(parseISO(uploadedAt), new Date(), {
                addSuffix: true,
              })}
          </Text>
        </Box>
      ) : (
        <Text css={{ color: '$gray900', textAlign: 'right' }}>
          {status === 'uploading' && getProgressText(progress)}
          {status === 'processing' && 'Processing...'}
          {status === 'error' && (
            <Text css={{ color: '$red900' }}>{error || 'Upload failed.'}</Text>
          )}
        </Text>
      )}
      {status === 'complete' && (
        <Flex
          css={{
            position: 'absolute',
            right: '10px',
            height: '100%',
            backgroundColor: '$loContrast',
            display: isHovering ? 'flex' : 'none',
            alignItems: 'center',
            paddingLeft: '50px',
          }}
        >
          <Tooltip content="Open skylink">
            <Button
              variant="ghost"
              as="a"
              href={isApp ? subdomainSkylink : pathSkylink}
              target="_blank"
            >
              <ExternalLinkIcon />
            </Button>
          </Tooltip>
          <Tooltip content="Copy to clipboard">
            <Button
              variant="ghost"
              onClick={() => clipboard.writeText(subdomainSkylink)}
            >
              <ClipboardCopyIcon />
            </Button>
          </Tooltip>
          <Button variant="ghost" onClick={copyToClipboard}>
            <TriangleDownIcon />
          </Button>
        </Flex>
      )}
    </Flex>
  )
}
