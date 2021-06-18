import {
  Flex,
  Box,
  Heading,
  Text,
  Container,
  Image,
} from '@riftdweb/design-system'
import { portals } from '../../shared/portals'
import SkynetHandshakeIcon from '../_icons/SkynetHandshakeIcon'
import { Link } from '../_shared/Link'

export default function Footer() {
  return (
    <Box
      css={{
        marginTop: '50px',
        paddingTop: '50px',
        paddingBottom: '50px',
        borderTop: '1px solid $gray200',
      }}
    >
      <Container size="3">
        <Flex>
          <Flex
            css={{
              flexDirection: 'column',
              gap: '$3',
              maxWidth: '800px',
              // textAlign: 'center',
            }}
          >
            <Heading css={{ fontWeight: 'bold' }}>
              <Image src="/wordmark.png" css={{ height: '25px' }} alt="Rift" />
            </Heading>
            <Text css={{ color: '$gray800' }}>
              Your decentralized workspace.
            </Text>
            <Text css={{ color: '$gray700', lineHeight: '20px' }}>
              As a{' '}
              <Link
                href="https://siasky.net/"
                target="_blank"
                css={{ color: '$gray700' }}
              >
                Skynet
              </Link>{' '}
              app, Rift provides a fully decentralized experience where all user
              data is tied to a self-sovereign identity and stored in a
              decentralized, globally accessible, permissioned filesystem (
              <Link
                href="https://blog.sia.tech/mysky-your-home-on-the-global-operating-system-of-the-future-5a288f89825c"
                target="_blank"
                css={{ color: '$gray700' }}
              >
                MySky
              </Link>
              ). The Rift application and all user data will load identically
              from from any public or private Skynet portal.
            </Text>
          </Flex>
          <Box css={{ flex: 1 }} />
          <Flex
            css={{
              flexDirection: 'column',
              gap: '$3',
              maxWidth: '800px',
              textAlign: 'right',
            }}
          >
            <Box css={{ color: '$hiContrast', marginLeft: 'auto' }}>
              <SkynetHandshakeIcon />
            </Box>
            {portals.map((portal) => {
              const hostname = `riftapp.hns.${portal.domain}`
              const url = `https://${hostname}`
              return (
                <Link
                  key={url}
                  href={url}
                  target="_blank"
                  css={{ color: '$gray800' }}
                >
                  {hostname}
                </Link>
              )
            })}
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}
