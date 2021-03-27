import { Box, Heading, Text } from '@modulz/design-system'

export function Uploader() {
  return (
    <Box css={{ py: '$3' }}>
      <Box css={{ py: '$5' }}>
        <Heading>Upload</Heading>
      </Box>
      <Text css={{ color: '$gray900' }}>A streamlined file upload and management experience is coming soon.</Text>
    </Box>
  )
}
