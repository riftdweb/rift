import { Text } from '@modulz/design-system'
import { formatDistance, parseISO } from 'date-fns'
import { Post } from '../../../hooks/feed/types'

type Props = {
  post: Post
  prefix?: string
}

export function PostTime({ post, prefix }: Props) {
  return (
    <Text size="1" css={{ color: '$gray900' }}>
      {prefix}{' '}
      {post.ts &&
        formatDistance(parseISO(new Date(post.ts).toISOString()), new Date(), {
          addSuffix: true,
        })}
    </Text>
  )
}
