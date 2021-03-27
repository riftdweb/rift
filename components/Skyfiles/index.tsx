import { Box } from '@modulz/design-system'
import { Formatter } from './Formatter'
import { Uploader } from './Uploader'

export function Skyfiles() {
  return (
    <Box css={{ py: '$3' }}>
      <Uploader />
      <Formatter />
    </Box>
  )
}
