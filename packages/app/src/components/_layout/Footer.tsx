import { Box, Heading, Text } from '@modulz/design-system'

export default function Footer() {
  return (
    <Box
      css={{
        marginTop: '50px',
        paddingTop: '50px',
        paddingBottom: '50px',
        textAlign: 'center',
        borderTop: '1px solid $gray200',
      }}
    >
      <Heading css={{ fontWeight: 'bold', marginBottom: '$2' }}>rift</Heading>
      <Text css={{ color: '$gray800' }}>Tools for the decentralized web.</Text>
    </Box>
  )
}
