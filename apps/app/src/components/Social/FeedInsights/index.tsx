import { Box, Flex, Heading, Text } from '@riftdweb/design-system'
import { Layout } from '../Layout'
import { Nav } from './Nav'
import { Algorithm } from './Algorithm'
import { KeywordsGraph } from './KeywordsGraph'
import { ScoreGraph } from './ScoreGraph'
import useDimensions from 'react-use-dimensions'

// const WIDTH = 800
const HEIGHT = 500

export function FeedInsights() {
  const [ref, { width }] = useDimensions()
  return (
    <Layout overflow="hidden">
      <Box css={{ width: '100%', overflow: 'hidden' }}>
        <Nav />
        <Box css={{ position: 'relative' }} ref={ref}>
          <Box css={{ my: '$3' }}>
            <Flex css={{ flexDirection: 'column', gap: '$6' }}>
              <Flex css={{ flexDirection: 'column', gap: '$6' }}>
                <Flex css={{ alignItems: 'center' }}>
                  <Heading size="1" css={{ color: '$gray11' }}>
                    Content relevancy scoring over time
                  </Heading>
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
                <Heading size="1" css={{ color: '$gray11' }}>
                  Keyword interaction events
                </Heading>
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
                    color: '$gray11',
                    textAlign: 'center',
                    margin: '0 auto',
                    maxWidth: '400px',
                  }}
                >
                  More visualizations and interactive options will be available
                  soon, providing richer data and a more complete relevancy
                  algorithm.
                </Text>
              </Flex>
            </Flex>
          </Box>
        </Box>
      </Box>
    </Layout>
  )
}
