import { Box, Flex, Text } from '@riftdweb/design-system'
import { DnsEntry } from '@riftdweb/types'
import { formatDistance } from 'date-fns'
import { SkylinkPeek } from '@riftdweb/core'
import { UpdateDnsEntry } from './_shared/UpdateDnsEntry'

type Props = {
  dnsEntry: DnsEntry
}

export function DnsRow({ dnsEntry }: Props) {
  const { name, dataLink, entryLink, addedAt, updatedAt } = dnsEntry

  return (
    <Box
      css={{
        position: 'relative',
        borderBottom: '1px solid $gray4',
        cursor: 'pointer',
        '&:last-of-type': {
          borderBottom: 'none',
        },
        '&:hover': {
          backgroundColor: '$gray2',
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
            <Text
              css={{
                lineHeight: '24px',
              }}
            >
              {name}
            </Text>
          </Box>
          <Box
            css={{ flex: 1, display: 'flex', position: 'relative', top: '1px' }}
          >
            <SkylinkPeek skylink={entryLink} />
          </Box>
          <Box
            css={{ flex: 1, display: 'flex', position: 'relative', top: '1px' }}
          >
            <SkylinkPeek skylink={dataLink} />
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
                color: '$gray11',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '24px',
                whiteSpace: 'nowrap',
              }}
            >
              {addedAt &&
                formatDistance(addedAt, new Date(), {
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
                color: '$gray11',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '24px',
                whiteSpace: 'nowrap',
              }}
            >
              {updatedAt &&
                formatDistance(updatedAt, new Date(), {
                  addSuffix: true,
                })}
            </Text>
          </Box>
        </Flex>
      </UpdateDnsEntry>
    </Box>
  )
}
