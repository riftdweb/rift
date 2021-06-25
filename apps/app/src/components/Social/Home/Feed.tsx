import { Flex } from '@riftdweb/design-system'
import { useFeed } from '../../../hooks/feed'
import { EntriesState } from '../../_shared/EntriesState'
import { FeedItem } from '../_shared/FeedItem'

export function Feed() {
  const { current, mode } = useFeed()

  return (
    <EntriesState
      response={current.response}
      loadingState={current.loadingState}
      emptyTitle="No posts"
      emptyMessage="This feed is empty."
    >
      <Flex
        css={{
          position: 'relative',
          flexDirection: 'column',
          gap: '$2',
        }}
      >
        {current.response.data?.entries.slice(0, 50).map((entry, index) => (
          <FeedItem
            key={entry.id}
            index={mode === 'top' ? index + 1 : undefined}
            entry={entry}
          />
        ))}
      </Flex>
    </EntriesState>
  )
}