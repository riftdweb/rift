import { Flex } from '@riftdweb/design-system'
import { useFeed } from '../../../hooks/feed'
import { FeedItem } from './FeedItem'

export function Feed() {
  const { rankedPosts } = useFeed()
  return (
    <Flex
      css={{
        position: 'relative',
        flexDirection: 'column',
        gap: '$2',
      }}
    >
      {(rankedPosts || []).slice(0, 50).map((item, index) => (
        <FeedItem key={item.post.id} index={index + 1} item={item} />
      ))}
    </Flex>
  )
}
