import { Box, Flex, Text } from '@riftdweb/design-system'
import { DnsEntry } from '@riftdweb/types'
import { formatDistance, parseISO } from 'date-fns'
import { useState } from 'react'
import { SkylinkPeek } from '../_shared/SkylinkPeek'
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
            padding: '0 $3',
            height: '40px',
          }}
        >
          <Box css={{ flex: 1 }}>
            <Text>{name}</Text>
          </Box>
          <Box css={{ flex: 1, display: 'flex' }}>
            <SkylinkPeek skylink={skylink} />
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
              '@bp1': {
                display: 'block',
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
