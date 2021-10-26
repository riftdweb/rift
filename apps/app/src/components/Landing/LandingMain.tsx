import { Box, Container, Flex, Image, Heading } from '@riftdweb/design-system'
import { CarouselTags, useCarousel } from './Carousel'
import { Fragment } from 'react'
import { LandingCta } from './LandingCta'

export function LandingMain() {
  const landingCarouselProps = useCarousel([
    {
      title: 'Document editing',
      image: 'docs',
    },
    {
      title: 'File sharing',
      image: 'files',
    },
    {
      title: 'Social feeds',
      image: 'social',
    },
    {
      title: 'Dev tools',
      image: 'dev',
    },
  ])

  return (
    <Fragment>
      <Container size="3">
        <Heading
          size="4"
          css={{
            marginTop: '$5',
            // fontSize: '$8',
            textAlign: 'center',
            // '@bp2': {
            //   fontSize: '$9',
            // },
          }}
        >
          The Internet apps you depend on every day, reimagined as software you
          control.
        </Heading>
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
          <LandingCta />
        </Container>
        <Box
          css={{
            borderBottom: '1px solid $gray6',
            overflow: 'hidden',
            padding: '5px 0 0 0',
            '@bp2': {
              padding: '10px 30px 0',
            },
          }}
        >
          <Container size="3" css={{ width: '100%' }}>
            <Box
              css={{
                position: 'relative',
                height: '150px',
                '@bp1': {
                  height: '250px',
                },
                '@bp2': {
                  height: '400px',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                },
                '@bp3': {
                  height: '500px',
                },
                transition: 'all 0.1s ease-in-out',
                bottom: 0,
              }}
            >
              <Box
                css={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 0 1px 5px rgba(255, 255, 255, .15)',
                  position: 'absolute',
                }}
              >
                <Image src={landingCarouselProps.currentItem.url} alt="Rift" />
              </Box>
            </Box>
          </Container>
        </Box>
      </Flex>
    </Fragment>
  )
}
