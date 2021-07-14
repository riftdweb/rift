import {
  ExclamationTriangleIcon,
  ExternalLinkIcon,
} from '@radix-ui/react-icons'
import { Box, Button, Flex, Text } from '@riftdweb/design-system'
import { Fragment } from 'react'
import { useSkylink } from '../../hooks/useSkylink'
import SpinnerIcon from '../_icons/SpinnerIcon'
import { Link } from './Link'
import { SkylinkContextMenu } from './SkylinkContextMenu'

type Props = {
  skylink: string
}

export function SkylinkInfo({ skylink: rawSkylink }: Props) {
  const {
    skylink,
    data,
    isApp,
    isV2,
    isDirectory,
    contentType,
    fileCount,
    size,
    isValidating,
    weblink,
  } = useSkylink(rawSkylink)

  if (rawSkylink && !skylink) {
    return (
      rawSkylink &&
      !skylink && (
        <Flex css={{ gap: '$2', alignItems: 'center', color: '$gray900' }}>
          <ExclamationTriangleIcon />
          <Text css={{ color: '$gray900', top: '-1px', position: 'relative' }}>
            Invalid Skylink
          </Text>
        </Flex>
      )
    )
  }

  return (
    skylink &&
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
            <Button<any> as="a" variant="ghost" href={weblink} target="_blank">
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
            {isDirectory
              ? `${isApp ? 'App' : 'Directory'} with ${fileCount} files`
              : 'File'}
          </Text>
          <Fragment>
            <Text size="1" css={{ color: '$gray800' }}>
              {isV2 ? 'Entry link' : 'Data link'}
            </Text>
            <Text size="1" css={{ color: '$gray800' }}>
              •
            </Text>
          </Fragment>
          <Text size="1" css={{ color: '$gray800' }}>
            {contentType}
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
      <Flex css={{ gap: '$2', alignItems: 'center', color: '$gray900' }}>
        <ExclamationTriangleIcon />
        <Text css={{ color: '$gray900', top: '-1px', position: 'relative' }}>
          Error loading Skyfile
        </Text>
      </Flex>
    ))
  )
}
