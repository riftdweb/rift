import { Box } from '@modulz/design-system'
import { FeedItem } from './FeedItem'
import { useFeed } from '../../../hooks/feed'

export function Feed() {
  const { rankedPosts } = useFeed()

  return (
    <Box css={{ position: 'relative' }}>
      {(rankedPosts || []).slice(0, 100).map((item, index) => (
        <FeedItem key={item.post.id} index={index + 1} item={item} />
      ))}
    </Box>
  )
}
