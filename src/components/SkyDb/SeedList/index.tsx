import { Box, Subheading, Text } from '@modulz/design-system'
import { useSeeds } from '../../../hooks/useSeeds'
import { Grid } from '../../_shared/Grid'
import { SeedCard } from './SeedCard'
import { Nav } from '../_shared/Nav'

function NoSeedsState() {
  return (
    <Box css={{ textAlign: 'center', padding: '$3 0' }}>
      <Subheading css={{ margin: '$2 0' }}>
        Manage and edit SkyDB data keys
      </Subheading>
      <Text css={{ color: '$gray900' }}>Add a seed above to get started!</Text>
    </Box>
  )
}

export default function SeedList() {
  const { seeds, isValidating, userHasNoSeeds } = useSeeds()

  return (
    <Box css={{ py: '$3' }}>
      <Nav />
      <Box css={{ my: '$3' }}>
        {seeds.length ? (
          <Grid>
            {seeds.map((seed) => (
              <SeedCard key={seed.id} seed={seed} />
            ))}
          </Grid>
        ) : isValidating ? (
          userHasNoSeeds ? (
            <NoSeedsState />
          ) : null
        ) : (
          <NoSeedsState />
        )}
      </Box>
    </Box>
  )
}
