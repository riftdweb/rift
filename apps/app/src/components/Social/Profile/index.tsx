import { useParams } from 'react-router-dom'
import { Box, Flex, Text } from '@riftdweb/design-system'
import { Feed } from './Feed'
import { Layout } from '../Layout'
import { User } from '../_shared/User'
import { Link } from '../../_shared/Link'
import { ArrowLeftIcon, ChatBubbleIcon, GlobeIcon } from '@radix-ui/react-icons'
import { useProfile } from '../../../hooks/useProfile'
import { useFeed } from '../../../hooks/feed'
import { UserContextMenu } from '../../_shared/UserContextMenu'

export function SocialProfile() {
  const { userId } = useParams()
  const profile = useProfile(userId)
  const { user } = useFeed()
  const entries = user.response.data?.entries || []

  return (
    <Layout>
      <Flex css={{ flexDirection: 'column', gap: '$4' }}>
        <Flex css={{ flexDirection: 'column', gap: '$2' }}>
          <Flex css={{ gap: '$1', alignItems: 'center' }}>
            <User size="3" userId={userId} profile={profile} />
            <Box css={{ flex: 1 }} />
            {/* <ProfileContextMenu /> */}
            <Link to={'/'}>
              <ArrowLeftIcon />
            </Link>
            <UserContextMenu userId={userId} profile={profile} />
          </Flex>
          {profile?.aboutMe && (
            <Flex css={{ gap: '$3', alignItems: 'center' }}>
              <Text css={{ lineHeight: '20px' }}>{profile.aboutMe}</Text>
            </Flex>
          )}
          <Flex css={{ marginTop: '$1' }}>
            <Flex css={{ gap: '$3', alignItems: 'center' }}>
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
            </Flex>
          </Flex>
        </Flex>
        <Feed />
      </Flex>
    </Layout>
  )
}
