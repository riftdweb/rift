import { Box, Text, Card, Flex } from '@modulz/design-system'
import { FeedItem } from './FeedItem'
import { useFeed } from '../../../hooks/feed'
import { Nav } from '../_shared/Nav'

// from RSS bot
export const reddit = {
  name: 'Reddit',
  sections: ['Popular', 'Tech', 'CryptoCurrency', 'Siacoin'],
}

export const cnn = {
  name: 'CNN',
  sections: ['Top Stories', 'World', 'US', 'Money Latest'],
}

function Follow({ name, section }) {
  return (
    <Card css={{ width: '100%', padding: '$2' }}>
      <Flex css={{ flexDirection: 'column', gap: '$1' }}>
        <Text css={{ color: '$hiContrast' }}>{name}</Text>
        <Text size="1" css={{ color: '$gray900' }}>
          {section}
        </Text>
      </Flex>
    </Card>
  )
}

export function NewsFeed() {
  const { rankedPosts } = useFeed()
  return (
    <Box css={{ py: '$3', position: 'relative' }}>
      <Box css={{ my: '$3' }}>
        <Nav />
        <Flex css={{ gap: '$8' }}>
          <Box css={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
            {(rankedPosts || []).slice(0, 50).map((item, index) => (
              <FeedItem key={item.post.id} index={index + 1} item={item} />
            ))}
          </Box>
          <Flex
            css={{
              marginTop: '10px',
              flexDirection: 'column',
              gap: '$2',
              width: '200px',
            }}
          >
            <Text
              css={{
                color: '$gray700',
                marginBottom: '$3',
              }}
            >
              Following
            </Text>
            <Flex
              css={{
                flexDirection: 'column',
                gap: '$2',
                marginBottom: '$2',
              }}
            >
              <Text
                css={{
                  color: '$hiContrast',
                  fontWeight: '600',
                }}
              >
                Users
              </Text>
              <Card css={{ padding: '$2' }}>
                <Text size="1" css={{ color: '$gray900', lineHeight: '16px' }}>
                  The ability to follow other users is coming soon along with
                  upvotes and reactions. This will provide a much richer source
                  of metadata. For the time being Rift news is populated by
                  Skynet enabled RSS bots.
                </Text>
              </Card>
            </Flex>
            <Flex
              css={{
                flexDirection: 'column',
                gap: '$2',
              }}
            >
              <Text
                css={{
                  color: '$hiContrast',
                  fontWeight: '600',
                  marginBottom: '$2',
                }}
              >
                Bots
              </Text>
              <Flex
                css={{
                  flexDirection: 'column',
                  width: '100%',
                  gap: '$3',
                }}
              >
                <Follow name="Hacker News" section="Top" />
                {reddit.sections.map((section) => (
                  <Follow name="Reddit" section={section} />
                ))}
                {cnn.sections.map((section) => (
                  <Follow name="CNN" section={section} />
                ))}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
}
