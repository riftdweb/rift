import { Box } from '@modulz/design-system'
import { FeedItem } from './FeedItem'
import { useFeed } from '../../../hooks/feed'
import { Nav } from '../_shared/Nav'

export function NewsFeed() {
  const { rankedPosts } = useFeed()
  return (
    <Box css={{ py: '$3', position: 'relative' }}>
      <Box css={{ my: '$3' }}>
        <Nav />
        <Box css={{ position: 'relative' }}>
          {(rankedPosts || []).slice(0, 50).map((item, index) => (
            <FeedItem key={item.post.id} index={index + 1} item={item} />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
