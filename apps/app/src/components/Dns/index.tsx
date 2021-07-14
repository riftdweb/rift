import { Box, Flex } from '@riftdweb/design-system'
import { useDns } from '../../hooks/useDns'
import { EntriesState } from '../_shared/EntriesState'
import { DnsRow } from './DnsRow'
import { Nav } from './_shared/Nav'

export function Dns() {
  const { dns } = useDns()

  return (
    <Box css={{ py: '$3', position: 'relative' }}>
      <Box css={{ my: '$3' }}>
        <Nav />
        <Box
          css={{
            margin: '$3 0',
            border: '1px solid $gray500',
            backgroundColor: '$panel',
            borderRadius: '$3',
            overflow: 'hidden',
          }}
        >
          <Flex
            css={{
              padding: '$2 $3',
              gap: '$1',
              borderBottom: '1px solid $gray300',
              color: '$gray900',
              fontSize: '14px',
              height: '44px',
              alignItems: 'center',
            }}
          >
            <Box css={{ flex: 1 }}>Name</Box>
            <Box
              css={{
                flex: 1,
              }}
            >
              Entry link (TXT)
            </Box>
            <Box
              css={{
                flex: 1,
              }}
            >
              Current data link
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
              Added
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
              Last updated
            </Box>
          </Flex>
          <EntriesState
            response={dns}
            emptyTitle="Manage and edit entry links"
            emptyMessage="Add a record to generate an entry link"
          >
            {dns.data?.entries
              .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
              .map((dnsEntry) => (
                <DnsRow key={dnsEntry.id} dnsEntry={dnsEntry} />
              ))}
          </EntriesState>
        </Box>
      </Box>
    </Box>
  )
}
