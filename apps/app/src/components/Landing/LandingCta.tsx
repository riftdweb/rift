import { Box, Button, Flex, Text } from '@riftdweb/design-system'
import { useSkynet } from '@riftdweb/core/src/contexts/skynet'

export function LandingCta() {
  const { login } = useSkynet()

  return (
    <Flex css={{ flexDirection: 'column', gap: '$2', textAlign: 'center' }}>
      <Box>
        <Button size="2" onClick={() => login()} css={{ cursor: 'pointer' }}>
          Get started with a Skynet identity
        </Button>
      </Box>
      <Text css={{ color: '$gray900' }}>
        No email, personal information, or cryptocurrency required. Encrypted
        and private.
      </Text>
    </Flex>
  )
}
