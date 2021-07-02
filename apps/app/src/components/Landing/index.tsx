import { Box } from '@riftdweb/design-system'
import { Grid } from '../_shared/Grid'
import { LandingCard } from './LandingCard'

const blurbs = [
  {
    title: 'Self-Sovereign',
    description: 'Users control',
  },
]

export function Landing() {
  return (
    <Box css={{ py: '$3', position: 'relative' }}>
      <Box css={{ my: '$3' }}>
        <Grid>
          {blurbs.map(({ title, description }) => (
            <LandingCard key={title} title={title} description={description} />
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
