import { Box, Flex, Subheading, Text } from '@riftdweb/design-system'
import { Layout } from '../Layout'
import { Nav } from '../_shared/Nav'
import { Algorithm } from './Algorithm'
import { KeywordsGraph } from './KeywordsGraph'
import { ScoreGraph } from './ScoreGraph'
import useDimensions from 'react-use-dimensions'

// const WIDTH = 800
const HEIGHT = 500

export function FeedInsights() {
  const [ref, { width }] = useDimensions()
  return (
    <Layout overflow="visible">
      <Nav />
      <Box css={{ position: 'relative' }} ref={ref}>
        <Box css={{ my: '$3' }}>
          <Flex css={{ flexDirection: 'column', gap: '$6' }}>
            <Flex css={{ flexDirection: 'column', gap: '$6' }}>
              <Flex css={{ alignItems: 'center' }}>
                <Subheading css={{ color: '$gray900' }}>
                  Feed algorithm content ranking over time
                </Subheading>
                <Box css={{ flex: 1 }} />
                <Algorithm />
              </Flex>
              <ScoreGraph width={width} height={HEIGHT} />
            </Flex>
            <Box
              css={{
                paddingTop: '$1',
                marginBottom: '$1',
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: 'rgba(0,0,0,0.05)',
              }}
            />
            <Flex css={{ flexDirection: 'column', gap: '$6' }}>
              <Subheading css={{ color: '$gray900' }}>
                Keywords extracted from content interaction events
              </Subheading>
              <KeywordsGraph width={width} height={HEIGHT} />
            </Flex>
            <Flex
              css={{
                flexDirection: 'column',
                gap: '$6',
                paddingBottom: '50px',
              }}
            >
              <Text
                css={{
                  color: '$gray900',
                  textAlign: 'center',
                  margin: '0 auto',
                  maxWidth: '400px',
                }}
              >
                More visualizations and interactive options will be available
                after components such as the Social DAC are integrated,
                providing richer data and a more complete relevancy algorithm.
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Layout>
  )
}
