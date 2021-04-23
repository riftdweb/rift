import { Box } from '@modulz/design-system'
import { Nav } from './_shared/Nav'
import { Feed } from './Feed'

export function News() {
  return (
    <Box css={{ py: '$3', position: 'relative' }}>
      <Box css={{ my: '$3' }}>
        <Nav />
        <Feed />
      </Box>
    </Box>
  )
}
