import { useParams } from 'react-router-dom'
import { Box, Flex, Text } from '@riftdweb/design-system'
import { Feed } from './Feed'
import { Layout } from '../Layout'
import { User } from '../_shared/User'
import { Link } from '../../_shared/Link'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
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
      <Flex css={{ flexDirection: 'column', gap: '$3' }}>
        <Flex css={{ gap: '$3', alignItems: 'center' }}>
          <Link to={'/'}>
            <ArrowLeftIcon />
          </Link>
          <User size="3" userId={userId} profile={profile} />
          <Box css={{ flex: 1 }} />
          {user.response.data && <Text>{entries.length} posts</Text>}
          {/* <ProfileContextMenu /> */}
          <UserContextMenu userId={userId} profile={profile} />
        </Flex>
        <Feed />
      </Flex>
    </Layout>
  )
}
