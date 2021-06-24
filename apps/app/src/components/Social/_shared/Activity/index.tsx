import { Box, Flex, Text } from '@riftdweb/design-system'
import { useFeed } from '../../../../hooks/feed'
import { useProfile } from '../../../../hooks/useProfile'
import { Link } from '../../../_shared/Link'
import { ActivityContextMenu } from './ActivityContextMenu'
import { Avatar } from '../../../_shared/Avatar'
import { RelativeTime } from '../RelativeTime'
import { StickySection } from '../StickySection'
import { StickyHeading } from '../StickyHeading'
import { EntriesState } from '../../../_shared/EntriesState'

function ActivityItem({ userId, message, at }) {
  const profile = useProfile(userId)
  return (
    <Flex
      css={{
        gap: '$2',
      }}
    >
      <Box css={{ marginTop: '$1' }}>
        <Avatar profile={profile} />
      </Box>
      <Flex
        css={{
          flexDirection: 'column',
          gap: '$1',
        }}
      >
        <Text size="1" css={{ lineHeight: '18px' }}>
          <Link
            to={`/users/${userId}`}
            css={{ color: '$violet900', display: 'inline' }}
          >
            {profile?.username || 'User'}
          </Link>
          <Text
            size="1"
            css={{
              color: '$hiContrast',
              display: 'inline',
            }}
          >
            {` ${message.slice(0, 50)}${message.length > 50 ? '...' : ''}`}
          </Text>
        </Text>
        {/* <RelativeTime time={at} /> */}
      </Flex>
    </Flex>
  )
}

export function Activity() {
  const { activity } = useFeed()
  return (
    <StickySection gap="0">
      <StickyHeading title="Activity" contextMenu={<ActivityContextMenu />} />
      <EntriesState
        response={activity.response}
        loadingState={activity.loadingState}
        emptyMessage="No activity yet."
      >
        <Flex
          css={{
            flexDirection: 'column',
            width: '100%',
            gap: '$4',
            flex: 1,
            padding: '$3 0',
            overflow: 'auto',
            borderBottom: '1px solid $gray200',
          }}
        >
          {activity.response.data?.entries.map((item) => (
            <ActivityItem key={item.id} {...item} />
          ))}
        </Flex>
      </EntriesState>
    </StickySection>
  )
}
