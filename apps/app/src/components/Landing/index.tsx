import { Box, Container, Flex, Heading } from '@riftdweb/design-system'
import { LandingMain } from './LandingMain'
import { LandingOwnData } from './LandingOwnData'
import { LandingOwnAlgo } from './LandingOwnAlgo'
import { LandingCta } from './LandingCta'

export function Landing() {
  return (
    <Box css={{ py: '$3', position: 'relative' }}>
      <Flex css={{ my: '$3', flexDirection: 'column', gap: '$6' }}>
        <LandingMain />
        <Container size="3">
          <Flex css={{ flexDirection: 'column', gap: '$8' }}>
            <Flex css={{ flexDirection: 'column', gap: '$4' }}>
              <LandingOwnData />
            </Flex>
            <Flex css={{ flexDirection: 'column', gap: '$4' }}>
              <LandingOwnAlgo />
            </Flex>
          </Flex>
        </Container>
        <Container size="3" css={{ my: '$9' }}>
          <Flex css={{ flexDirection: 'column', gap: '$6' }}>
            <Heading size="4" css={{ fontSize: '$8', textAlign: 'center' }}>
              Control your destiny
            </Heading>
            <LandingCta />
          </Flex>
        </Container>
      </Flex>
    </Box>
  )
}
