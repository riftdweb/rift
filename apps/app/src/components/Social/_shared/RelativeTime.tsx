import { Text } from '@riftdweb/design-system'
import { formatDistance, parseISO } from 'date-fns'
import { Post } from '../../../hooks/feed/types'

type Props = {
  time: number
  prefix?: string
}

export function RelativeTime({ time, prefix }: Props) {
  return (
    <Text size="1" css={{ color: '$gray900' }}>
      {prefix}{' '}
      {time &&
        formatDistance(parseISO(new Date(time).toISOString()), new Date(), {
          addSuffix: true,
        })}
    </Text>
  )
}
