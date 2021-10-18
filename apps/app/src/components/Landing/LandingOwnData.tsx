import {
  Box,
  Flex,
  Link,
  Paragraph,
  Text,
  Title,
} from '@riftdweb/design-system'
import { Fragment } from 'react'

export function LandingOwnData() {
  return (
    <Fragment>
      <Box>
        <Flex css={{ flexDirection: 'column', gap: '$2' }}>
          <Title css={{ fontSize: '$8' }}>Own your data</Title>
          <Paragraph>
            <Text
              css={{
                display: 'inline',
              }}
            >
              Rift is a decentralized alternative to the core Internet apps we
              all depend on every day. Rift includes features for file storage,
              file sharing, document editing, social feeds, search, and video
              streaming, as well as advanced tools for inspecting data,
              deploying websites, and managing DNS.
            </Text>
          </Paragraph>
          <Paragraph>
            <Text
              css={{
                display: 'inline',
                borderRadius: '2px',
                backgroundColor: '$pink900',
                color: '$loContrast',
                padding: '3px 1px',
              }}
            >
              Companies like Google and Facebook control your digital life. They
              collect, view, sell, and even{' '}
              <Text
                css={{
                  fontWeight: '600',
                  display: 'inline',
                  backgroundColor: '$pink900',
                  fontStyle: 'italic',
                  color: '$loContrast',
                }}
              >
                own
              </Text>{' '}
              your private information in exchange for free Internet apps.
            </Text>{' '}
            <Text css={{ display: 'inline' }}>
              They store your personal data in propriety systems and formats,
              and control access. Individuals need sovereignty over their
              personal information.
            </Text>{' '}
          </Paragraph>
          <Paragraph>
            <Text
              css={{
                display: 'inline',
                borderRadius: '2px',
                backgroundColor: '$pink900',
                color: '$loContrast',
                padding: '3px 1px',
              }}
            >
              Rift lets you enjoy similar functionality while retaining full
              ownership over your data.
            </Text>{' '}
            <Text css={{ display: 'inline' }}>
              Rift runs on{' '}
              <Link target="_blank" href="https://siasky.net">
                Skynet
              </Link>
              {', '}a new Internet protocol where no single app or corporation
              directly controls your data. Apps request permission and then
              access your data from a fully encrypted and decentralized file
              system that only you control!
            </Text>
          </Paragraph>
        </Flex>
      </Box>
      <Flex css={{ gap: '$4', flexWrap: 'wrap' }}>
        <Box
          css={{
            flex: '100%',
            '@bp2': {
              flex: 1,
            },
          }}
        >
          <Title css={{ fontSize: '$7' }}>Permissionless</Title>
          <Paragraph>
            <Text css={{ display: 'inline' }}>
              Rift and Skynet are permissionless and self-sovereign - anyone can
              create a psuedonymous Skynet account which is just a cryptographic
              keypair. Only the keyholder has the ability to access, decrypt, or
              modify data and they can do so from anywhere on the Internet.
            </Text>
          </Paragraph>
        </Box>
        <Box
          css={{
            flex: '100%',
            '@bp2': {
              flex: 1,
            },
          }}
        >
          <Title css={{ fontSize: '$7' }}>Private</Title>
          <Paragraph>
            <Text css={{ display: 'inline' }}>
              When signed in to Rift, all metadata and files are encrypted and
              stored in your personal file system on the Skynet network. Certain
              data such as a your profile and feed are intentionally made public
              but beyond this everything is encrypted and private by default.
            </Text>
          </Paragraph>
        </Box>
      </Flex>
      <Flex css={{ gap: '$4', flexWrap: 'wrap' }}>
        <Box
          css={{
            flex: '100%',
            '@bp2': {
              flex: 1,
            },
          }}
        >
          <Title css={{ fontSize: '$7' }}>Open</Title>
          <Paragraph>
            <Text css={{ display: 'inline' }}>
              In addition to storing all data in a private space, Rift runs on
              open data storage standards for things like files, profiles,
              posts, feeds, and the social graph. This means that with your
              permission, other applications can seamlessly access the exact
              same source data. This is important because it means your files
              and videos automatically move with you when you decide you like a
              different app for file sharing or video streaming.
            </Text>
          </Paragraph>
        </Box>
        <Box
          css={{
            flex: '100%',
            '@bp2': {
              flex: 1,
            },
          }}
        >
          <Title css={{ fontSize: '$7' }}>Decentralized</Title>
          <Paragraph>
            <Text css={{ display: 'inline' }}>
              Rift is built as a pure Skynet app, meaning its only dependency is
              access to the Skynet network. Rift can be accessed via any public
              or private Skynet Portal. It is important to note that Skynet
              Portals are entirely stateless and interchangeable. Any piece of
              data can be accessed from anywhere on the Internet in under a few
              hundred milliseconds regardless of where on the network the data
              was originally written or pinned. If you decide to stop using a
              specific Portal your data will be immediately available from any
              other Portal.
            </Text>
          </Paragraph>
        </Box>
      </Flex>
    </Fragment>
  )
}
