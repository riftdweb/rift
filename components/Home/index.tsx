import { Box, Subheading } from '@modulz/design-system'
import { LinkCard } from './LinkCard'
import { SkappCard } from './SkappCard'
import { Grid } from '../_shared/Grid'
import { skapps } from '../../shared/skapps'
import { links } from '../../shared/links'
import { useSelectedPortal } from '../../hooks/useSelectedPortal'

export function Home() {
  const [selectedPortal] = useSelectedPortal()
  return (
    <Box css={{ my: '$3', position: 'relative' }}>
      <Box css={{ my: '$3' }}>
        <Subheading css={{ py: '$3' }}>Top Apps</Subheading>
        <Grid>
          {skapps.map(({ hnsDomain, title, description, tags }) =>
            <SkappCard
              key={hnsDomain}
              portal={selectedPortal}
              hnsDomain={hnsDomain}
              title={title}
              description={description}
              tags={tags} />
          )}
        </Grid>
        <Subheading css={{ py: '$3' }}>Top Resources</Subheading>
        <Grid>
          {links.map(({ url, title, description }) =>
            <LinkCard
              key={url}
              url={url}
              title={title}
              description={description} />
          )}
        </Grid>
      </Box>
    </Box>
  )
}
