import { Box, Avatar, Flex, Text } from '@riftdweb/design-system'
import { Link } from '../../_shared/Link'
import { RelativeTime } from './RelativeTime'

const activityItems = [
  {
    id: '1',
    userId: 'parox',
    content:
      'CDC: Slow pace of rural vaccinations could hinder end of the pandemic',
    at: new Date().getTime() - 1000 * 60 * 20,
  },
  {
    id: '1',
    userId: 'parox',
    content:
      'CDC: Slow pace of rural vaccinations could hinder end of the pandemic',
    at: new Date().getTime() - 1000 * 60 * 60 * 1,
  },
  {
    id: '1',
    userId: 'parox',
    content:
      'CDC: Slow pace of rural vaccinations could hinder end of the pandemic',
    at: new Date().getTime() - 1000 * 60 * 60 * 2,
  },
  {
    id: '1',
    userId: 'parox',
    content:
      'CDC: Slow pace of rural vaccinations could hinder end of the pandemic',
    at: new Date().getTime() - 1000 * 60 * 60 * 5,
  },
]

function ActivityItem({ userId, content, at }) {
  return (
    <Flex
      css={{
        gap: '$2',
      }}
    >
      <Box css={{ marginTop: '$1' }}>
        <Avatar />
      </Box>
      <Flex
        css={{
          flexDirection: 'column',
          gap: '$1',
        }}
      >
        <Text size="1" css={{ lineHeight: '18px' }}>
          <Link to={'/news'} css={{ color: '$violet900', display: 'inline' }}>
            {userId}
          </Link>
          <Text
            size="1"
            css={{
              color: '$hiContrast',
              display: 'inline',
            }}
          >
            {` reacted to `}
          </Text>
          <Link to={'/news'} css={{ color: '$violet900', display: 'inline' }}>
            {`${content.slice(0, 50)}${content.length > 50 ? '...' : ''}`}
          </Link>
        </Text>
        <RelativeTime time={at} />
      </Flex>
    </Flex>
  )
}

export function Activity() {
  return (
    <Flex
      css={{
        position: 'sticky',
        top: 0,
        flexDirection: 'column',
        gap: '$3',
        width: '200px',
        pt: '$3',
      }}
    >
      <Text
        css={{
          color: '$gray900',
          fontWeight: '600',
        }}
      >
        Activity
      </Text>
      <Flex
        css={{
          flexDirection: 'column',
          width: '100%',
          gap: '$4',
        }}
      >
        {activityItems.map((item) => (
          <ActivityItem key={item.id} {...item} />
        ))}
      </Flex>
    </Flex>
  )
}
