import React from 'react'
import {
  ExclamationTriangleIcon,
  ExternalLinkIcon,
} from '@radix-ui/react-icons'
import { Box, Button, Flex, Text, Tooltip } from '@riftdweb/design-system'
import { Fragment } from 'react'
import { useSkylink } from '../hooks/useSkylink'
import { SpinnerIcon } from './_icons/SpinnerIcon'
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
    health,
  } = useSkylink(rawSkylink)

  if (rawSkylink && !skylink) {
    return (
      rawSkylink &&
      !skylink && (
        <Flex css={{ gap: '$2', alignItems: 'center', color: '$gray11' }}>
          <ExclamationTriangleIcon />
          <Text css={{ color: '$gray11', top: '-1px', position: 'relative' }}>
            Invalid Skylink
          </Text>
        </Flex>
      )
    )
  }

  const isCheckingHealth = health.quick.isValidating || health.full.isValidating
  const healthStatus =
    health.isEnabled && health.full.data?.basesectorredundancy
      ? getHealthStatus(health.full.data.basesectorredundancy)
      : health.quick.data?.basesectorredundancy
      ? getHealthStatus(health.quick.data.basesectorredundancy, true)
      : null

  return (
    skylink &&
    (data ? (
      <Flex css={{ flexDirection: 'column', gap: '$2' }}>
        <Flex css={{ alignItems: 'center' }}>
          <Link
            href={weblink}
            target="_blank"
            css={{
              flex: 1,
              overflow: 'hidden',
              lineHeight: '20px',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {data.metadata.filename}
          </Link>
          <Flex css={{ marginRight: '-10px' }}>
            <Button<any> as="a" ghost href={weblink} target="_blank">
              <ExternalLinkIcon />
            </Button>
            <SkylinkContextMenu skylink={skylink} />
          </Flex>
        </Flex>
        <Flex css={{ gap: '$1', alignItems: 'center' }}>
          <Text
            size="1"
            css={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: '$gray10',
            }}
          >
            {isDirectory
              ? `${isApp ? 'App' : 'Directory'} with ${fileCount} files`
              : 'File'}
          </Text>
          <Fragment>
            <Text size="1" css={{ color: '$gray10' }}>
              {isV2 ? 'Resolver skylink' : 'Data skylink'}
            </Text>
            <Text size="1" css={{ color: '$gray10' }}>
              •
            </Text>
          </Fragment>
          <Text size="1" css={{ color: '$gray10' }}>
            {contentType}
          </Text>
          <Text size="1" css={{ color: '$gray10' }}>
            •
          </Text>
          <Text size="1" css={{ color: '$gray10' }}>
            {size}
          </Text>
          <Text size="1" css={{ color: '$gray10' }}>
            •
          </Text>
          {health.isEnabled && isCheckingHealth && (
            <Box css={{ color: healthStatus ? healthStatus.color : '$gray10' }}>
              <SpinnerIcon size="12" />
            </Box>
          )}
          {healthStatus ? (
            <Tooltip
              content={`Base sector redundancy ${
                healthStatus.isPending
                  ? `at least ${healthStatus.redundancy}`
                  : healthStatus.redundancy
              }`}
            >
              <Text
                size="1"
                css={{
                  color: healthStatus.color,
                }}
              >
                {healthStatus.label}
              </Text>
            </Tooltip>
          ) : (
            <Text
              size="1"
              css={{
                color: '$gray10',
              }}
            >
              Checking health
            </Text>
          )}
        </Flex>
      </Flex>
    ) : isValidating ? (
      <Box css={{ color: '$gray11' }}>
        <SpinnerIcon />
      </Box>
    ) : (
      <Flex css={{ gap: '$2', alignItems: 'center', color: '$gray11' }}>
        <ExclamationTriangleIcon />
        <Text css={{ color: '$gray11', top: '-1px', position: 'relative' }}>
          Error loading Skyfile
        </Text>
      </Flex>
    ))
  )
}

const excellent = 8
const good = 6
const poor = 4

function getHealthStatus(
  redundancy: number,
  isPending: boolean = false
): {
  color: string
  label: string
  redundancy: number
  isPending: boolean
} {
  if (isPending && redundancy >= excellent) {
    return {
      color: '$green10',
      label: 'Excellent health',
      redundancy,
      isPending,
    }
  }
  if (isPending && redundancy >= good) {
    return {
      color: '$green10',
      label: 'At least good health',
      redundancy,
      isPending,
    }
  }
  if (isPending) {
    return {
      color: '$gray10',
      label: 'Checking health',
      redundancy,
      isPending,
    }
  }

  if (redundancy >= excellent) {
    return {
      color: '$green10',
      label: 'Excellent health',
      redundancy,
      isPending,
    }
  }
  if (redundancy >= good) {
    return {
      color: '$green10',
      label: 'Good health',
      redundancy,
      isPending,
    }
  }
  if (redundancy >= poor) {
    return {
      color: '$red10',
      label: `Poor health (${redundancy})`,
      redundancy,
      isPending,
    }
  }
  return {
    color: '$red10',
    label: `Health at risk (${redundancy})`,
    redundancy,
    isPending,
  }
}
