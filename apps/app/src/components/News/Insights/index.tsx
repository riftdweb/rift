import { Flex, Box, Text, Subheading } from '@riftdweb/design-system'
import { Nav } from '../_shared/Nav'
import { ScoreGraph } from './ScoreGraph'
import { KeywordsGraph } from './KeywordsGraph'
import { Algorithm } from './Algorithm'

const WIDTH = 1145
const HEIGHT = 500

export function NewsInsights() {
  return (
    <Box css={{ py: '$3', position: 'relative' }}>
      <Box css={{ my: '$3' }}>
        <Nav section="insights" />
        <Flex css={{ flexDirection: 'column', gap: '$6' }}>
          <Flex css={{ flexDirection: 'column', gap: '$6' }}>
            <Flex css={{ alignItems: 'center' }}>
              <Subheading css={{ color: '$gray900' }}>
                Feed algorithm content ranking over time
              </Subheading>
              <Box css={{ flex: 1 }} />
              <Algorithm />
            </Flex>
            <ScoreGraph width={WIDTH} height={HEIGHT} />
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
            <KeywordsGraph width={WIDTH} height={HEIGHT} />
          </Flex>
          <Flex
            css={{ flexDirection: 'column', gap: '$6', paddingBottom: '50px' }}
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
              after components such as the Social DAC are integrated, providing
              richer data and a more complete relevancy algorithm.
            </Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
}
