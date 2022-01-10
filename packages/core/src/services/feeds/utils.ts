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

export function getViewingUserId(): string {
  // manually get userId from route because provider is above Route switch
  const pathParts = window.location.hash.split('/')
  const paramUserId = (pathParts[1] === 'users' && pathParts[2]) || undefined

  return paramUserId
}
