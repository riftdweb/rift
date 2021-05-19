import { Post } from '../../../hooks/feed/types'
import { RelativeTime } from './RelativeTime'

type Props = {
  post: Post
  prefix?: string
}

export function PostTime({ post, prefix }: Props) {
  return <RelativeTime time={post.ts} prefix={prefix} />
}
