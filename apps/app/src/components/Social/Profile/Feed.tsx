import { Flex } from '@riftdweb/design-system'
import { useParams } from 'react-router-dom'
import { FeedItem } from '../_shared/FeedItem'
import { useObservableState } from 'observable-hooks'
import { getFeedEntries$ } from '@riftdweb/core/src/services/feeds'

export function Feed() {
  const { userId } = useParams()
  const entries = useObservableState(getFeedEntries$(userId))

  return (
    // <EntriesState
    //   key={userId}
    //   response={user.response}
    //   loadingState={user.loadingStateCurrentUser}
    //   emptyTitle="No posts"
    //   emptyMessage="This user has not posted anything yet."
    // >
    <Flex
      // Very weird, but some reason list appends on user change without this
      key={userId}
      css={{
        position: 'relative',
        flexDirection: 'column',
        gap: '$2',
      }}
    >
      {entries.slice(0, 50).map((entry) => (
        <FeedItem key={entry.id} entry={entry} />
      ))}
    </Flex>
    // </EntriesState>
  )
}
