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
            <SkylinkPeek skylink={entryLink} />
          </Box>
          <Box css={{ flex: 1, display: 'flex' }}>
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
                color: '$gray900',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
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
                color: '$gray900',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
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
