import { Box, Heading } from '@modulz/design-system'
import { useSelectedPortal } from '../../hooks/useSelectedPortal'
import { links } from '../../shared/links'
import { skapps } from '../../shared/skapps'
import { Grid } from '../_shared/Grid'
import { LinkCard } from './LinkCard'
import { SkappCard } from './SkappCard'

export default function Home() {
  const [selectedPortal] = useSelectedPortal()
  return (
    <Box css={{ py: '$3', position: 'relative' }}>
      <Box css={{ my: '$3' }}>
        <Heading css={{ py: '$3' }}>Apps</Heading>
        <Grid>
          {skapps.map(({ hnsDomain, title, description, tags }) => (
            <SkappCard
              key={hnsDomain}
              portal={selectedPortal}
              hnsDomain={hnsDomain}
              title={title}
              description={description}
              tags={tags}
            />
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
