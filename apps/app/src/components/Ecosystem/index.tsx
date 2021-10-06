import { Box, Container, Heading } from '@riftdweb/design-system'
import { usePortal, links, skapps, Grid } from '@riftdweb/core'
import { LinkCard } from './LinkCard'
import { SkappCard } from './SkappCard'
import { Nav } from './_shared/Nav'

export function Ecosystem() {
  const { portal } = usePortal()
  return (
    <Container size="3" css={{ py: '$3', position: 'relative' }}>
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
    </Container>
  )
}
