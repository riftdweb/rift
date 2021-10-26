import {
  Box,
  Flex,
  Image,
  Paragraph,
  Text,
  Heading,
} from '@riftdweb/design-system'
import { CarouselTags, useCarousel } from './Carousel'
import { Fragment } from 'react'

export function LandingOwnAlgo() {
  const devCarouselProps = useCarousel([
    {
      title: 'Visualize your algorithm',
      image: 'algoVisualize',
    },
    {
      title: 'Understand your algorithm',
      image: 'algoInsights',
    },
    {
      title: 'Tune your algorithm',
      image: 'algoTune',
    },
  ])

  return (
    <Fragment>
      <Box css={{ flex: 1 }}>
        <Flex css={{ flexDirection: 'column', gap: '$2' }}>
          <Heading size="4" css={{ fontSize: '$8' }}>
            Own your algorithms
          </Heading>
          <Paragraph>
            <Text css={{ display: 'inline' }}>
              The importance of user-owned data also extends to data processing.
              Social feed algorithms on Instagram, Facebook, and TikTok are
              opaque and optimized for advertisers and maximizing view time.
              With Rift you can personalize your algorithm so that it reflects
              your own preference and interpretation of satisfaction or
              productivity. To support this idea of algorithmic transparency,
              the Rift interface includes visual indicators that help you
              understand why content was prioritized. Rift also provides an
              advanced dashboard that visualizes the ranking process and even
              lets you tune parameters.
            </Text>
          </Paragraph>
        </Flex>
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
            boxShadow: '0 0 1px 5px rgba(255, 255, 255, .15)',
            transition: 'all 0.2s ease-in-out',
            borderRadius: '8px',
            maxWidth: '800px',
            margin: '0 auto',
            overflow: 'hidden',
            '&:hover': {
              transform: 'scale(1.01)',
            },
          }}
        >
          <Image src={devCarouselProps.currentItem.url} alt="Rift" />
        </Box>
      </Flex>
    </Fragment>
  )
}
