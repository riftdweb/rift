import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Image,
  Link,
  Paragraph,
  Subtitle,
  Text,
  Title,
} from '@riftdweb/design-system'
import { Grid } from '../_shared/Grid'
import { LandingCard } from './LandingCard'
import dataUrl from './images/data.png'
import dnsUrl from './images/dns.png'
import filesSetDnsUrl from './images/files-set-dns.png'
import filesUrl from './images/files.png'
import homeUrl from './images/home.png'
import homeAlgoUrl from './images/home-algo.png'
import insightsUrl from './images/insights.png'
import profileUrl from './images/profile.png'
import searhSkylinkUrl from './images/search-skylink.png'
import { useEffect, useState } from 'react'
import { useSkynet } from '../../contexts/skynet'
import { CarouselTags, useCarousel } from './Carousel'

const imageMap = {
  data: dataUrl,
  dns: dnsUrl,
  filesSetDns: filesSetDnsUrl,
  files: filesUrl,
  home: homeUrl,
  homeAlgo: homeAlgoUrl,
  insights: insightsUrl,
  profile: profileUrl,
  searchSkylink: searhSkylinkUrl,
}

export function Landing() {
  const { login } = useSkynet()
  const [currentImage, setCurrentImage] = useState<string>('homeAlgo')

  const landingCarouselProps = useCarousel([
    {
      title: 'Search',
      image: 'searchSkylink',
    },
    {
      title: 'File sharing',
      image: 'files',
    },
    {
      title: 'Social media',
      image: 'homeAlgo',
    },
    {
      title: 'Videos',
      image: 'profile',
    },
    {
      title: 'Developer tools',
      image: 'insights',
    },
  ])

  const devCarouselProps = useCarousel([
    {
      title: 'Visualize your algorithms',
      image: 'postAlgo',
    },
    {
      title: 'Understand your algorithms',
      image: 'insightsSmall',
    },
    {
      title: 'Tune your algorithms',
      image: 'tuneSmall',
    },
  ])

  return (
    <Box css={{ py: '$3', position: 'relative' }}>
      <Flex css={{ my: '$3', flexDirection: 'column', gap: '$6' }}>
        <Container size="3">
          <Title css={{ marginTop: '$5', fontSize: '$9', textAlign: 'center' }}>
            {/* {`Your critical productivity tools,\n
          fully decentralized and controlled by only you.`} */}
            {/* {`The productivity tools you depend on,\n
          controlled by only you.`} */}
            The internet apps you depend on every day, except controlled by only
            you.
          </Title>
        </Container>
        <Flex
          css={{
            flexDirection: 'column',
            gap: '$5',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <Container size="3">
            <CarouselTags {...landingCarouselProps} />
          </Container>
          <Container size="3">
            <Flex
              css={{ flexDirection: 'column', gap: '$2', textAlign: 'center' }}
            >
              <Box>
                <Button
                  size="2"
                  onClick={() => login()}
                  css={{ cursor: 'pointer' }}
                >
                  1-click sign up with MySky
                </Button>
              </Box>
              <Text css={{ color: '$gray900' }}>
                No email or personal information required.
              </Text>
            </Flex>
          </Container>
          {/* <Flex css={{ gap: '$2', justifyContent: 'center' }}>
            <Link target="_blank" href="https://support.siasky.net/">
              What is Skynet?
            </Link>
            <Link
              target="_blank"
              href="https://skynet-labs.gitbook.io/skynet-developer-guide/-MeWB-PswkM0GRx42-BS/skynet-topics/mysky"
            >
              What is MySky?
            </Link>
          </Flex> */}
          <Container size="3" css={{ width: '100%' }}>
            <Box
              css={{
                padding: '0 30px',
                borderBottom: '1px solid $gray200',
              }}
            >
              <Box
                css={{
                  position: 'relative',
                  height: '400px',
                  transition: 'all 0.1s ease-in-out',
                  bottom: 0,
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <Box
                  css={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow:
                      '0px 60px 123px 25px $colors$shadowLight, 0px 35px 75px 35px $colors$shadowDark',
                    position: 'absolute',
                  }}
                >
                  <Image
                    src={landingCarouselProps.currentItem.url}
                    alt="Rift"
                  />
                </Box>
              </Box>
            </Box>
          </Container>
        </Flex>
        <Container size="3">
          <Flex css={{ flexDirection: 'column', gap: '$8' }}>
            <Box css={{}}>
              <Title css={{ fontSize: '$8' }}>Own your data</Title>
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
                  Companies like Google, Dropbox, Snapchat, currently own your
                  data.
                </Text>{' '}
                <Text css={{ display: 'inline' }}>
                  Dropbox getting too expensive? Snapchat going out of style?
                  Good luck moving all your photos and important files to
                  another app.
                </Text>{' '}
                <Text
                  css={{
                    display: 'inline',
                    borderRadius: '2px',
                    backgroundColor: '$pink900',
                    color: '$loContrast',
                    padding: '3px 1px',
                  }}
                >
                  Rift puts you back in full ownership and full control of your
                  data.
                </Text>{' '}
                <Text css={{ display: 'inline' }}>
                  Rift runs on{' '}
                  <Link target="_blank" href="https://siasky.net">
                    Skynet
                  </Link>
                  {', '}
                  <Link
                    target="_blank"
                    href="https://blog.sia.tech/mysky-your-home-on-the-global-operating-system-of-the-future-5a288f89825c"
                  >
                    {'MySky, and open data standards'}
                  </Link>{' '}
                  where no single app or corporation controls your data, instead
                  authorized apps access your data from a fully encrypted and
                  decentralized filesystem that only you control!
                </Text>
              </Paragraph>
            </Box>
            <Flex>
              <Box css={{ flex: 1 }}>
                <Title css={{ fontSize: '$8' }}>Own your algorithms</Title>
                <Paragraph>
                  Social feed algorithms on Instagram and Facebook are opaque
                  and optimized for advertising and maximizing view time. Do you
                  want to personalize and tune your very own algorithms? Maybe
                  optimized for your efficiency or your own idea of
                  satisfaction?
                </Paragraph>
              </Box>
              <Flex
                css={{
                  flexDirection: 'column',
                  gap: '$5',
                  flex: 2,
                  height: '500px',
                }}
              >
                <CarouselTags {...devCarouselProps} />
                <Box
                  css={{
                    position: 'relative',
                    boxShadow:
                      '0px 60px 123px 25px $colors$shadowLight, 0px 35px 75px 35px $colors$shadowDark',
                    transition: 'all 0.2s ease-in-out',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'scale(1.01)',
                    },
                  }}
                >
                  <Image src={devCarouselProps.currentItem.url} alt="Rift" />
                </Box>
              </Flex>
            </Flex>
          </Flex>
        </Container>
        <Title css={{ fontSize: '$8' }}>Control your destiny</Title>
        <Paragraph>
          Companies like Google, Dropbox, Snapchat, come and go - your data
          should outlive the apps you use rather than get stuck and die. Own
          your data and bring it along to the next trendy app.
        </Paragraph>
        <Title css={{ fontSize: '$8' }}>Rift is just a data steward</Title>
        <Paragraph>
          Rift provides an interface for interacting with your data. If you want
          to view your files with another app, totally possible. If you decide
          you no longer want to use Rift, because you already control your data,
          there is absolutely no lockin or migration process.
        </Paragraph>
      </Flex>
    </Box>
  )
}
