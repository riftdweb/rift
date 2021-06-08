import { Button, Flex, Text } from '@riftdweb/design-system'
import { Fragment } from 'react'
import { useSkynet } from '../../../../hooks/skynet'
import { useUsers } from '../../../../hooks/users'
import { FollowingContextMenu } from './FollowingContextMenu'
import { StickySection } from '../StickySection'
import { StickyHeading } from '../StickyHeading'
import { Follow } from './Follow'
import { SuggestedFollow } from './SuggestedFollow'

export function Following() {
  const { userId, myProfile, login } = useSkynet()
  const { followings, suggestions, handleFollow, handleUnfollow } = useUsers()

  if (!userId) {
    return (
      <StickySection>
        <StickyHeading title="Following" />
        <Flex
          css={{
            flexDirection: 'column',
            gap: '$2',
            alignItems: 'center',
            textAlign: 'center',
            margin: '$2 0',
          }}
        >
          <Text
            size="2"
            css={{
              color: '$gray900',
              lineHeight: '16px',
              flex: 1,
            }}
          >
            Log in to follow other users and build a personalized feed.
          </Text>
          <Button onClick={() => login()}>Log in with MySky</Button>
        </Flex>
      </StickySection>
    )
  }

  return (
    <StickySection>
      <Follow key={userId} profile={myProfile} userId={userId} />
      <Flex
        css={{
          flexDirection: 'column',
          width: '100%',
          flex: 1,
          overflow: 'auto',
          gap: '$2',
          borderBottom: '1px solid $gray200',
        }}
      >
        <StickyHeading
          title="Following"
          contextMenu={<FollowingContextMenu />}
        />
        <Flex
          css={{
            flexDirection: 'column',
            width: '100%',
            gap: '$2',
            paddingBottom: '$2',
            flex: 1,
          }}
        >
          {followings.map(({ userId, profile }) => (
            <Follow
              key={userId}
              profile={profile}
              userId={userId}
              handleUnfollow={handleUnfollow}
            />
          ))}
        </Flex>
        {!!suggestions.length && (
          <Fragment>
            <StickyHeading title="Suggestions" />
            <Flex
              css={{
                flexDirection: 'column',
                width: '100%',
                gap: '$2',
                paddingBottom: '$2',
                flex: 1,
              }}
            >
              {suggestions.map(({ userId, profile }) => (
                <SuggestedFollow
                  key={userId}
                  userId={userId}
                  profile={profile}
                  handleFollow={handleFollow}
                />
              ))}
            </Flex>
          </Fragment>
        )}
      </Flex>
    </StickySection>
  )
}
