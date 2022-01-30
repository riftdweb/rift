import { Box, Button, Flex, Text } from '@riftdweb/design-system'
import { login } from '@riftdweb/core/src/services/account'

export function LandingCta() {
  return (
    <Flex css={{ flexDirection: 'column', gap: '$3', textAlign: 'center' }}>
      <Box>
        <Button size="2" onClick={() => login()} css={{ cursor: 'pointer' }}>
          Get started with a Skynet identity
        </Button>
      </Box>
      <Text
        size="3"
        css={{
          color: '$gray11',
          fontSize: '$1',
          lineHeight: '16px',
          '@bp2': {
            fontSize: '$3',
          },
        }}
      >
        No email, personal information, or cryptocurrency required. Encrypted
        and private.
      </Text>
    </Flex>
  )
}
