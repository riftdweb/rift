import { Flex } from '@riftdweb/design-system'
import useSWR from 'swr'
import { useParams } from 'react-router-dom'
import { FeedItem } from '../_shared/FeedItem'
import { EntryFeed } from '../../../hooks/feed/types'
import { EntriesState } from '../../_shared/EntriesState'
import { fetchUserEntries } from '../../../hooks/feed/shared'

export function Feed() {
  const { userId } = useParams()
  const userEntriesFeedResponse = useSWR<EntryFeed>(['entries', userId], () =>
    fetchUserEntries(userId)
  )
  const entries = userEntriesFeedResponse.data?.entries || []

  return (
    <EntriesState
      response={userEntriesFeedResponse}
      emptyTitle="No posts"
      emptyMessage="This user has not posted anything yet."
    >
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
    </EntriesState>
  )
}
