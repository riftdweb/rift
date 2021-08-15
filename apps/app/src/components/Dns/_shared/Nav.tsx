import { Box, Flex, Heading } from '@riftdweb/design-system'
import { Link } from '../../_shared/Link'
import { AddDnsEntry } from './AddDnsEntry'
import { LearnHow } from './LearnHow'

export function Nav() {
  return (
    <Heading css={{ my: '$5' }}>
      <Flex css={{ gap: '$1', alignItems: 'center', height: '30px' }}>
        <Link to="/dns">DNS</Link>
        <Box css={{ flex: 1 }} />
        <Box
          css={{
            display: 'none',
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
