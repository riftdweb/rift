import { useParams } from 'react-router-dom'
import { Box, Button, Flex } from '@riftdweb/design-system'
import { Feed } from './Feed'
import { Layout } from '../Layout'
import { Link } from '../../_shared/Link'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { UserProfile } from '../../_shared/UserProfile'

export function SocialProfile() {
  const { userId } = useParams()

  return (
    <Layout>
      <Flex css={{ flexDirection: 'column', gap: '$3' }}>
        <Flex css={{ marginLeft: '-$1' }}>
          <Link
            to={'/'}
            as="button"
            content="Back to home feed"
            tooltipAlign="end"
            css={{ padding: 0 }}
          >
            <Button variant="ghost" css={{ color: '$gray900' }}>
              <Box css={{ mr: '$1' }}>
                <ArrowLeftIcon />
              </Box>
              Back to feed
            </Button>
          </Link>
          <Box css={{ flex: 1 }} />
        </Flex>
        <UserProfile userId={userId} />
        <Feed />
      </Flex>
    </Layout>
  )
}
