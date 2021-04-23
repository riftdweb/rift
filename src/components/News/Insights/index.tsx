import { Box } from '@modulz/design-system'
import { Nav } from '../_shared/Nav'
import { Graph } from './Graph'

export function NewsInsights() {
  return (
    <Box css={{ py: '$3', position: 'relative' }}>
      <Box css={{ my: '$3' }}>
        <Nav />
        <Graph />
      </Box>
    </Box>
  )
}
