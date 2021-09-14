import { Box, Container, Flex, Image, Title } from '@riftdweb/design-system'
import { CarouselTags, useCarousel } from './Carousel'
import { Fragment } from 'react'
import { LandingCta } from './LandingCta'

export function LandingMain() {
  const landingCarouselProps = useCarousel([
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
        <Title
          css={{
            marginTop: '$5',
            fontSize: '$8',
            textAlign: 'center',
            '@bp2': {
              fontSize: '$9',
            },
          }}
        >
          The Internet apps you depend on every day, reimagined as software you
          control.
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
          <LandingCta />
        </Container>
        <Box
          css={{
            borderBottom: '1px solid $gray500',
            overflow: 'hidden',
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
                },
                '@bp3': {
                  height: '500px',
                },
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
