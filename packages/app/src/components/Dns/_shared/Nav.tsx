import { Box, Flex, Heading, Text } from '@modulz/design-system'
import { DnsEntry } from '../../../shared/types'
import { Link } from '../../_shared/Link'
import { AddDnsEntry } from './AddDnsEntry'

type Props = {
  dnsEntry?: DnsEntry
}

export function Nav({ dnsEntry }: Props) {
  return (
    <Heading css={{ my: '$5' }}>
      <Flex css={{ gap: '$1', alignItems: 'center', height: '30px' }}>
        <Link to="/dns">DNS</Link>
        {dnsEntry && <Text>/</Text>}
        {dnsEntry && (
          <Link
            css={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            to={`/dns/${dnsEntry.id}`}
          >
            {dnsEntry.name}
          </Link>
        )}
        {!dnsEntry && <Box css={{ flex: 1 }} />}
        {!dnsEntry && <AddDnsEntry />}
      </Flex>
    </Heading>
  )
}
