import { Box, Flex, Text } from '@riftdweb/design-system'
import { useUser, Link, Avatar, ScrollArea } from '@riftdweb/core'
import { ActivityContextMenu } from './ActivityContextMenu'
import { StickySection } from '../StickySection'
import { StickyHeading } from '../StickyHeading'
import { useObservableState } from 'observable-hooks'
import { getActivity$ } from '@riftdweb/core/src/services/feeds'
import { Activity as IActivity } from '@riftdweb/types'

function ActivityItem({ userId, message, at }: IActivity) {
  const user = useUser(userId)
  const profile = user?.profile
  return (
    <Flex
      css={{
        gap: '$2',
        paddingRight: '$1',
      }}
    >
      <Box css={{ marginTop: '$1' }}>
        <Avatar userId={userId} profile={profile?.data} />
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
            css={{ color: '$violet10', display: 'inline' }}
          >
            {profile?.data?.username || 'User'}
          </Link>
          <Text
            size="1"
            css={{
              color: '$hiContrast',
              display: 'inline',
            }}
          >
            {/* {` ${message.slice(0, 50)}${message.length > 50 ? '...' : ''}`} */}
            {` ${message}`}
          </Text>
        </Text>
        {/* <RelativeTime time={at} /> */}
      </Flex>
    </Flex>
  )
}

export function Activity() {
  const activity = useObservableState(getActivity$())
  return (
    <StickySection gap="0" width="100%">
      <StickyHeading title="Activity" contextMenu={<ActivityContextMenu />} />
      {/* <EntriesState
        response={activity.response}
        loadingState={activity.loadingState}
        validatingMessage="Loading"
        emptyMessage="No activity yet."
      > */}
      <Box
        css={{
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <ScrollArea>
          <Flex
            css={{
              flexDirection: 'column',
              padding: '$3 $1',
              gap: '$4',
            }}
          >
            {activity.map((item) => (
              <ActivityItem key={item.id} {...item} />
            ))}
          </Flex>
        </ScrollArea>
      </Box>
      {/* </EntriesState> */}
    </StickySection>
  )
}
