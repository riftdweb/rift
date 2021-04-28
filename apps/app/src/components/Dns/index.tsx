import { Box, Flex, Subheading, Text } from '@riftdweb/design-system'
import { useDns } from '../../hooks/useDns'
import { DnsRow } from './DnsRow'
import { Nav } from './_shared/Nav'

function NonIdealState() {
  return (
    <Box css={{ textAlign: 'center', padding: '$3 0' }}>
      <Subheading css={{ margin: '$2 0' }}>
        Manage and edit DNS entries
      </Subheading>
      <Text css={{ color: '$gray900' }}>Add a DNS entry to get started!</Text>
    </Box>
  )
}

export function Dns() {
  const { dnsEntries, isValidating, userHasNoDnsEntries } = useDns()

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
              Skylink
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
          {dnsEntries.length ? (
            <Box>
              {dnsEntries
                .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
                .map((dnsEntry) => (
                  <DnsRow key={dnsEntry.id} dnsEntry={dnsEntry} />
                ))}
            </Box>
          ) : isValidating ? (
            userHasNoDnsEntries ? (
              <NonIdealState />
            ) : null
          ) : (
            <NonIdealState />
          )}
        </Box>
      </Box>
    </Box>
  )
}
