import { Box, Subheading, Text } from '@modulz/design-system'
import { useSeeds } from '../../hooks/useSeeds'
import { Grid } from '../_shared/Grid'
import { AddSeed } from './AddSeed'
import { HomeCard } from './HomeCard'
import { Nav } from './Nav'

export function SkyDbHome() {
  const { seeds } = useSeeds()

  return (
    <Box css={{ py: '$3' }}>
      <Nav />
      <AddSeed />
      <Box css={{ my: '$3' }}>
        {seeds.length ? (
          <Grid>
            {seeds.map((seed) => (
              <HomeCard key={seed} seed={seed} />
            ))}
          </Grid>
        ) : (
          <Box css={{ textAlign: 'center', padding: '$3 0' }}>
            <Subheading css={{ margin: '$2 0' }}>
              Welcome to the SkyDB data tool.
            </Subheading>
            <Text css={{ color: '$gray900' }}>
              Add a seed phrase above to get started!
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}
