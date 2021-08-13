import { Entry } from '@riftdweb/types'
import { RelativeTime } from './RelativeTime'

type Props = {
  entry: Entry
  prefix?: string
}

export function PostTime({ entry, prefix }: Props) {
  return <RelativeTime time={entry.post.ts} prefix={prefix} />
}
