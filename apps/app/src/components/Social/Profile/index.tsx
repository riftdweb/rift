import { useParams } from 'react-router-dom'
import { Flex } from '@riftdweb/design-system'
import { Feed } from './Feed'
import { Layout } from '../Layout'
import { User } from '../_shared/User'
import { Link } from '../../_shared/Link'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useProfile } from '../../../hooks/useProfile'

export function SocialProfile() {
  const { userId } = useParams()
  const profile = useProfile(userId)
  return (
    <Layout>
      <Flex css={{ flexDirection: 'column', gap: '$3' }}>
        <Flex css={{ gap: '$3', alignItems: 'center' }}>
          <Link to={'/'}>
            <ArrowLeftIcon />
          </Link>
          <User size="3" userId={userId} profile={profile} />
        </Flex>
        <Feed />
      </Flex>
    </Layout>
  )
}
