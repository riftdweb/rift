import React from 'react'
import { GitHubLogoIcon, CommitIcon } from '@radix-ui/react-icons'
import {
  Code,
  Flex,
  Box,
  Text,
  Container,
  Image,
} from '@riftdweb/design-system'
import { portals } from '../../shared/portals'
import { LogoIcon } from '../_icons/LogoIcon'
import { SkynetHandshakeIcon } from '../_icons/SkynetHandshakeIcon'
import { Link } from '../Link'

const sha = process.env.REACT_APP_GIT_SHA

export function Footer() {
  return (
    <Box
      css={{
        marginTop: '50px',
        paddingTop: '50px',
        paddingBottom: '50px',
        borderTop: '1px solid $gray3',
      }}
    >
      <Container size="4">
        <Flex
          css={{
            gap: '$4',
            flexDirection: 'column',
            '@bp2': {
              gap: '$1',
              flexDirection: 'row',
            },
          }}
        >
          <Flex
            css={{
              flexDirection: 'column',
              gap: '$3',
              maxWidth: '800px',
            }}
          >
            <Flex
              css={{
                gap: '$2',
              }}
            >
              <LogoIcon />
              <Image
                src="/wordmark-mono.png"
                css={{ height: '25px', filter: '$colors-logoFilter' }}
                alt="Rift"
              />
            </Flex>
            <Text css={{ color: '$gray10' }}>
              Your decentralized workspace.
            </Text>
            <Text css={{ color: '$gray8', lineHeight: '20px' }}>
              As a{' '}
              <Link
                href="https://siasky.net/"
                target="_blank"
                css={{ color: '$gray8' }}
              >
                Skynet
              </Link>{' '}
              application, Rift provides a fully decentralized experience where
              all user data is tied to a self-sovereign identity and stored in
              an encrypted{' '}
              <Link
                href="https://blog.sia.tech/mysky-your-home-on-the-global-operating-system-of-the-future-5a288f89825c"
                target="_blank"
                css={{ color: '$gray8' }}
              >
                file system
              </Link>{' '}
              that only the user controls. The Rift application and all user
              data can be accessed from any public or private Skynet portal.
            </Text>
          </Flex>
          <Box css={{ flex: 1 }} />
          <Flex
            css={{
              flexDirection: 'column',
              gap: '$6',
              maxWidth: '800px',
              '@bp2': {
                textAlign: 'right',
              },
            }}
          >
            <Flex css={{ flexDirection: 'column', gap: '$5' }}>
              <Box
                css={{ color: '$hiContrast', '@bp2': { marginLeft: 'auto' } }}
              >
                <SkynetHandshakeIcon />
              </Box>
              <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                <Text size="4">Portals</Text>
                {portals
                  .filter((portal) => !portal.disabled)
                  .map((portal) => {
                    const hostname = `riftapp.hns.${portal.domain}`
                    const url = `https://${hostname}`
                    return (
                      <Link
                        key={url}
                        href={url}
                        target="_blank"
                        css={{ color: '$gray10' }}
                      >
                        {hostname}
                      </Link>
                    )
                  })}
              </Flex>
            </Flex>
            <Flex css={{ flexDirection: 'column', gap: '$2' }}>
              <Text size="4">Open Source</Text>
              <Link
                href="https://github.com/riftdweb/rift"
                target="_blank"
                css={{
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'none',
                  },
                }}
              >
                <Code
                  css={{
                    borderRadius: '$1',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  main
                </Code>
              </Link>
              {sha && (
                <Link
                  href={`https://github.com/riftdweb/rift/commit/${sha}`}
                  target="_blank"
                  css={{
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'none',
                    },
                  }}
                >
                  <Code
                    css={{
                      borderRadius: '$1',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {sha.slice(0, 6)}
                  </Code>
                </Link>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}
