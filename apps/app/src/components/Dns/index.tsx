import { Box, Container, Flex } from '@riftdweb/design-system'
import { useDns, EntriesState } from '@riftdweb/core'
import { DnsRow } from './DnsRow'
import { Nav } from './_shared/Nav'

export function Dns() {
  const { dns } = useDns()

  return (
    <Container size="3" css={{ py: '$3', position: 'relative' }}>
      <Box css={{ my: '$3' }}>
        <Nav />
        <Box
          css={{
            margin: '$3 0',
            border: '1px solid $gray6',
            backgroundColor: '$panel',
            borderRadius: '$3',
            overflow: 'hidden',
          }}
        >
          <Flex
            css={{
              padding: '$2 $3',
              gap: '$1',
              borderBottom: '1px solid $gray4',
              color: '$gray11',
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
              Resolver skylink
            </Box>
            <Box
              css={{
                flex: 1,
              }}
            >
              Target skylink
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
            emptyTitle="Manage and edit resolver skylinks"
            emptyMessage="Add a record to generate a resolver skylink"
          >
            {dns.data?.entries
              .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
              .map((dnsEntry) => (
                <DnsRow key={dnsEntry.id} dnsEntry={dnsEntry} />
              ))}
          </EntriesState>
        </Box>
      </Box>
    </Container>
  )
}
