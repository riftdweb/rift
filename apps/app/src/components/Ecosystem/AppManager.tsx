import { Box } from '@riftdweb/design-system'
import { useParams } from 'react-router-dom'
import { usePortal } from '@riftdweb/core'
import { skapps } from '@riftdweb/core'
import { Grid } from '@riftdweb/core'
import { SkappCard } from './SkappCard'
import { Nav } from './_shared/Nav'

export default function AppManager() {
  const { portal } = usePortal()
  const { appId } = useParams()
  const isValidating = false
  const app = skapps.find((app) => app.id === appId)

  if (!app && isValidating) {
    return null
  }

  if (!isValidating && !app) {
    return <Box>404</Box>
  }

  return (
    <Box css={{ py: '$3', position: 'relative' }}>
      <Box css={{ my: '$3' }}>
        <Nav app={app} />
        <Grid>
          {skapps.map((app) => (
            <SkappCard key={app.id} app={app} portal={portal} />
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
