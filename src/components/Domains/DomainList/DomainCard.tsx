import {
  Badge,
  Box,
  Card,
  Flex,
  Subheading,
  Text,
  Tooltip,
} from '@modulz/design-system'
import { Link } from 'react-router-dom'
import { Domain } from '../../../shared/types'
import { formatDistance, parseISO } from 'date-fns'
import { DomainContextMenu } from '../_shared/DomainContextMenu'

type Props = {
  domain: Domain
}

export function DomainCard({ domain }: Props) {
  const { id, name, keys = [], addedAt } = domain
  return (
    <Box
      css={{
        overflow: 'hidden',
      }}
    >
      <Card
        as={Link}
        to={`/data/${encodeURIComponent(domain.name)}`}
        css={{
          padding: '$2 $3 $3 $3',
        }}
        variant="interactive"
      >
        <Flex css={{ flexDirection: 'column', gap: '$2' }}>
          <Flex css={{ gap: '$2', alignItems: 'center' }}>
            <Tooltip align="start" content={name}>
              <Subheading
                css={{
                  my: '$1',
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </Subheading>
            </Tooltip>
            <Box css={{ color: 'red' }}>
              <DomainContextMenu domain={domain} right="-10px" />
            </Box>
          </Flex>
          <Box>
            <Tooltip
              align="start"
              content={`Currently tracking ${keys.length} data keys`}
            >
              <Badge key={id}>
                {keys.length} data {keys.length === 1 ? 'key' : 'keys'}
              </Badge>
            </Tooltip>
          </Box>
          <Flex css={{ marginTop: '$2', alignItems: 'center' }}>
            <Text
              size="1"
              css={{ color: '$gray800', flex: 1, textAlign: 'right' }}
            >
              {'Added '}
              {formatDistance(parseISO(addedAt), new Date(), {
                addSuffix: true,
              })}
            </Text>
          </Flex>
        </Flex>
      </Card>
    </Box>
  )
}
