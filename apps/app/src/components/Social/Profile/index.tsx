import { useParams } from 'react-router-dom'
import { Box, Button, ControlGroup, Flex, Text } from '@riftdweb/design-system'
import { Feed } from './Feed'
import { Layout } from '../Layout'
import { User } from '../_shared/User'
import { Link } from '../../_shared/Link'
import {
  ArrowLeftIcon,
  ChatBubbleIcon,
  EyeOpenIcon,
  GlobeIcon,
} from '@radix-ui/react-icons'
import { useProfile } from '../../../hooks/useProfile'
import { useFeed } from '../../../hooks/feed'
import { UserContextMenu } from '../../_shared/UserContextMenu'
import { useUsers } from '../../../hooks/users'
import { useMemo } from 'react'

export function SocialProfile() {
  const { userId } = useParams()
  const profile = useProfile(userId)
  const { user } = useFeed()
  const { handleFollow, checkIsFollowingUser, checkIsMyself } = useUsers()
  const entries = user.response.data?.entries || []

  const isFollowingUser = useMemo(() => checkIsFollowingUser(userId), [
    checkIsFollowingUser,
    userId,
  ])
  const isMyself = useMemo(() => checkIsMyself(userId), [checkIsMyself, userId])

  return (
    <Layout>
      <Flex css={{ flexDirection: 'column', gap: '$4' }}>
        <Flex css={{ flexDirection: 'column', gap: '$2' }}>
          <Flex css={{ gap: '$2', alignItems: 'center' }}>
            <User size="3" userId={userId} profile={profile} />
            <Box css={{ flex: 1 }} />
            <ControlGroup>
              <Link
                to={'/'}
                as="button"
                content="Back to home feed"
                tooltipAlign="end"
              >
                <ArrowLeftIcon />
              </Link>
              <UserContextMenu userId={userId} profile={profile} />
            </ControlGroup>
          </Flex>
          {profile?.aboutMe && (
            <Flex css={{ gap: '$3', alignItems: 'center' }}>
              <Text css={{ lineHeight: '20px' }}>{profile.aboutMe}</Text>
            </Flex>
          )}
          <Flex css={{ marginTop: '$1' }}>
            <Flex
              css={{
                gap: '$3',
                alignItems: 'center',
                width: '100%',
                height: '$3',
              }}
            >
              {profile?.location && (
                <Flex css={{ gap: '$1', alignItems: 'center' }}>
                  <Text css={{ fontSize: '$2', color: '$gray900' }}>
                    <GlobeIcon />
                  </Text>
                  <Text css={{ fontSize: '$2', color: '$gray900' }}>
                    {profile.location}
                  </Text>
                </Flex>
              )}
              <Flex css={{ gap: '$3', alignItems: 'center' }}>
                {user.response.data && (
                  <Flex css={{ gap: '$1', alignItems: 'center' }}>
                    <Text css={{ fontSize: '$2', color: '$gray900' }}>
                      <ChatBubbleIcon />
                    </Text>
                    <Text css={{ fontSize: '$2', color: '$gray900' }}>
                      {entries.length} posts
                    </Text>
                  </Flex>
                )}
              </Flex>
              <Box css={{ flex: 1 }} />
              {!isMyself &&
                (isFollowingUser ? (
                  <Flex css={{ gap: '$1', alignItems: 'center' }}>
                    <Text css={{ fontSize: '$2', color: '$gray900' }}>
                      <EyeOpenIcon />
                    </Text>
                    <Text css={{ fontSize: '$2', color: '$gray900' }}>
                      Following
                    </Text>
                  </Flex>
                ) : (
                  <Button
                    size="1"
                    onClick={() => handleFollow(userId, profile)}
                  >
                    Follow
                  </Button>
                ))}
            </Flex>
          </Flex>
        </Flex>
        <Feed />
      </Flex>
    </Layout>
  )
}
