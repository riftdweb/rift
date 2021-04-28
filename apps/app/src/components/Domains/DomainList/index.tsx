import { Box, Subheading, Text } from '@riftdweb/design-system'
import { useDomains } from '../../../hooks/domains'
import { Grid } from '../../_shared/Grid'
import { DomainCard } from './DomainCard'
import { Nav } from '../_shared/Nav'

function NoDomainsState() {
  return (
    <Box css={{ textAlign: 'center', padding: '$3 0' }}>
      <Subheading css={{ margin: '$2 0' }}>
        Manage and edit data keys
      </Subheading>
      <Text css={{ color: '$gray900' }}>
        Add a domain above to get started!
      </Text>
    </Box>
  )
}

export default function DomainList() {
  const { domains, isValidating, userHasNoDomains } = useDomains()

  return (
    <Box css={{ py: '$3' }}>
      <Nav />
      <Box css={{ my: '$3' }}>
        {domains.length ? (
          <Grid>
            {domains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </Grid>
        ) : isValidating ? (
          userHasNoDomains ? (
            <NoDomainsState />
          ) : null
        ) : (
          <NoDomainsState />
        )}
      </Box>
    </Box>
  )
}
