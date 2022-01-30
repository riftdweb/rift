import { Flex } from '@riftdweb/design-system'
import { FeedItem } from '../_shared/FeedItem'
// import { useAccount } from '@riftdweb/core/src/hooks/useAccount'
import { useObservableState } from 'observable-hooks'
import { getFeedEntries$ } from '@riftdweb/core/src/services/feeds'

export function Feed() {
  // const { myUserId } = useAccount()
  const mode = 'top'
  const feedEntries = useObservableState(getFeedEntries$(mode))

  // let emptyTitle = 'Welcome to Rift!'
  // let emptyMessage =
  //   'Log in to MySky to get started building your decentralized feed.'

  // if (myUserId) {
  //   emptyTitle = 'Welcome to Rift!'
  //   emptyMessage =
  //     'Follow some users to get started building your decentralized feed.'
  // }

  return (
    // <EntriesState
    //   response={current.response}
    //   loadingState={current.loadingState}
    //   emptyTitle={emptyTitle}
    //   emptyMessage={emptyMessage}
    // >
    <Flex
      css={{
        position: 'relative',
        flexDirection: 'column',
        gap: '$2',
      }}
    >
      {feedEntries.slice(0, 50).map((entry, index) => (
        <FeedItem
          key={entry.id}
          index={mode === 'top' ? index + 1 : undefined}
          entry={entry}
        />
      ))}
    </Flex>
    // </EntriesState>
  )
}
