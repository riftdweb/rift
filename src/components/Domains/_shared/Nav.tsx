import { Box, Flex, Heading, Text } from '@modulz/design-system'
import { Domain } from '../../../shared/types'
import { Link } from '../../_shared/Link'
import { DomainContextMenu } from './DomainContextMenu'
import { AddDomain } from './AddDomain'

type Props = {
  domain?: Domain
}

export function Nav({ domain }: Props) {
  return (
    <Heading css={{ my: '$5' }}>
      <Flex css={{ gap: '$1', alignItems: 'center' }}>
        <Link href="/domains">Domains</Link>
        {domain && <Text>/</Text>}
        {domain && (
          <Link
            css={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            href={`/domains/${encodeURIComponent(domain.name)}`}
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
