import { Box } from '@modulz/design-system'
import { AddSeed } from './AddSeed'
import { Nav } from './Nav';
import { Grid } from '../_shared/Grid';
import { useSeeds } from '../../hooks/useSeeds'
import { HomeCard } from './HomeCard'

export function SkyDbHome() {
  const [seeds] = useSeeds()

  return (
    <Box css={{ py: '$3' }}>
      <Nav />
      <AddSeed />
      <Box css={{ my: '$3' }}>
        <Grid>
          {seeds.map((seed) =>
            <HomeCard
              key={seed}
              seed={seed} />
          )}
        </Grid>
      </Box>
    </Box>
  )
}
