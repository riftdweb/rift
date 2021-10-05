import { Flex } from '@riftdweb/design-system'
import { useFeed } from '@riftdweb/core/src/contexts/feed'
import { useSkynet } from '@riftdweb/core/src/contexts/skynet'
import { EntriesState } from '@riftdweb/core/src/components/_shared/EntriesState'
import { FeedItem } from '../_shared/FeedItem'

export function Feed() {
  const { myUserId } = useSkynet()
  const { current, mode } = useFeed()

  let emptyTitle = 'Welcome to Rift!'
  let emptyMessage =
    'Log in to MySky to get started building your decentralized feed.'

  if (myUserId) {
    emptyTitle = 'Welcome to Rift!'
    emptyMessage =
      'Follow some users to get started building your decentralized feed.'
  }

  return (
    <EntriesState
      response={current.response}
      loadingState={current.loadingState}
      emptyTitle={emptyTitle}
      emptyMessage={emptyMessage}
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
