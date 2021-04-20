import { Box, Text, Flex, Tooltip } from '@modulz/design-system'
import { Pencil2Icon } from '@radix-ui/react-icons'
import { formatDistance, parseISO } from 'date-fns'
import { useState } from 'react'
import { copyToClipboard } from '../../shared/clipboard'
import { DnsEntry } from '../../shared/types'
import { UpdateDnsEntry } from './_shared/UpdateDnsEntry'

type Props = {
  dnsEntry: DnsEntry
}

export function DnsRow({ dnsEntry }: Props) {
  const { name, skylink, addedAt, updatedAt } = dnsEntry
  const [isHovering, setIsHovering] = useState<boolean>(false)

  return (
    <Box
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      css={{
        position: 'relative',
        borderBottom: '1px solid $gray300',
        cursor: 'pointer',
        '&:last-of-type': {
          borderBottom: 'none',
        },
        '&:hover': {
          backgroundColor: '$gray100',
        },
      }}
    >
      <UpdateDnsEntry dnsEntry={dnsEntry}>
        <Flex
          css={{
            position: 'relative',
            alignItems: 'center',
            gap: '$1',
            padding: '$2 $3',
          }}
        >
          <Box css={{ flex: 1 }}>
            <Text>{name}</Text>
          </Box>
          <Box css={{ flex: 1 }}>
            <Tooltip align="start" content="Copy skylink">
              <Text
                size="2"
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(skylink, 'skylink')
                }}
                css={{
                  display: 'inline',
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
            <Text
              css={{
                color: '$gray900',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {addedAt &&
                formatDistance(parseISO(addedAt), new Date(), {
                  addSuffix: true,
                })}
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
            <Text
              css={{
                color: '$gray900',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {updatedAt &&
                formatDistance(parseISO(updatedAt), new Date(), {
                  addSuffix: true,
                })}
            </Text>
          </Box>
        </Flex>
      </UpdateDnsEntry>
    </Box>
  )
}
