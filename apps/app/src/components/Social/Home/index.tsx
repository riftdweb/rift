import { Feed } from './Feed'
import { Layout } from '../Layout'
import { Controls } from './Controls'
import { Box } from '@riftdweb/design-system'

export function SocialHome() {
  return (
    <Layout overflow="hidden">
      <Box>
        <Controls />
        <Feed />
      </Box>
    </Layout>
  )
}
