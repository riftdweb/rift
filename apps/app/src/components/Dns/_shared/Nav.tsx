import { Box, Flex, Heading } from '@riftdweb/design-system'
import { Link } from '@riftdweb/core/src/components/_shared/Link'
import { AddDnsEntry } from './AddDnsEntry'
import { LearnHow } from './LearnHow'

export function Nav() {
  return (
    <Heading css={{ my: '$5' }}>
      <Flex css={{ gap: '$1', alignItems: 'center', height: '30px' }}>
        <Link to="/dns">DNS</Link>
        <Box
          css={{
            display: 'block',
            '@bp2': {
              display: 'none',
            },
            flex: 1,
          }}
        />
        <Box
          css={{
            flex: 1,
            display: 'none',
            textAlign: 'right',
            '@bp2': {
              display: 'block',
            },
          }}
        >
          <LearnHow />
        </Box>
        <AddDnsEntry />
      </Flex>
    </Heading>
  )
}
