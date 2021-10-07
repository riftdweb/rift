import { Entry } from '@riftdweb/types'

export function dedupePendingUserEntries(
  entries: Entry[],
  pendingEntries: Entry[]
) {
  return [
    ...pendingEntries.filter(
      (pendingEntry) =>
        !entries.find(
          (networkEntry) =>
            // Best we can do atm, is exact text, and just in case of
            // intentional duplicates check that the timestamp is newer
            networkEntry.post.content.text === pendingEntry.post.content.text &&
            networkEntry.post.ts > pendingEntry.post.ts
        )
    ),
    ...entries,
  ]
}
