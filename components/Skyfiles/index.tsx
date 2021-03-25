import { Avatar, Box, Card, Flex, Heading, Input, Subheading, Text } from '@modulz/design-system'

export function Skyfiles() {
  return (
    <Box css={{ my: '$3' }}>
      <Input
        size="3"
        variant="ghost"
        autoFocus
        css={{ ':focus': { outline: 'none !important', border: 'none !important' } }}
        placeholder="Search files" />
      <Box css={{ my: '$3' }}>
        <Subheading>Recent files</Subheading>
      </Box>
    </Box>
  )
}
