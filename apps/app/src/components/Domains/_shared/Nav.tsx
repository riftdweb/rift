import { Box, Flex, Heading, Text } from '@riftdweb/design-system'
import { Domain } from '@riftdweb/types'
import { Link } from '../../_shared/Link'
import { AddDomain } from './AddDomain'
import { DomainContextMenu } from './DomainContextMenu'

type Props = {
  domain?: Domain
}

export function Nav({ domain }: Props) {
  return (
    <Heading css={{ my: '$5' }}>
      <Flex css={{ gap: '$1', alignItems: 'center' }}>
        <Link to="/data">Data</Link>
        {domain && <Text>/</Text>}
        {domain && (
          <Link
            css={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            to={`/data/${encodeURIComponent(domain.name)}`}
          >
            {domain.name}
          </Link>
        )}
        {!domain && <Box css={{ flex: 1 }} />}
        {!domain && <AddDomain />}
        {domain && (
          <DomainContextMenu domain={domain} variant="gray" size="2" />
        )}
      </Flex>
    </Heading>
  )
}
