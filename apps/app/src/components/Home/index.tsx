import { Box, Heading } from '@riftdweb/design-system'
import { useSelectedPortal } from '../../hooks/useSelectedPortal'
import { links } from '../../shared/links'
import { skapps } from '../../shared/skapps'
import { Grid } from '../_shared/Grid'
import { LinkCard } from './LinkCard'
import { SkappCard } from './SkappCard'
import { Nav } from './_shared/Nav'

export function Home() {
  const [portal] = useSelectedPortal()
  return (
    <Box css={{ py: '$3', position: 'relative' }}>
      <Box css={{ my: '$3' }}>
        <Nav />
        <Grid>
          {skapps.map((app) => (
            <SkappCard key={app.id} app={app} portal={portal} />
          ))}
        </Grid>
        <Heading css={{ py: '$3' }}>Resources</Heading>
        <Grid>
          {links.map(({ url, title, description }) => (
            <LinkCard
              key={url}
              url={url}
              title={title}
              description={description}
            />
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
