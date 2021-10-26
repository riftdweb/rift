import { Text } from '@riftdweb/design-system'
import { formatDistance, parseISO } from 'date-fns'

type Props = {
  time: number
  prefix?: string
}

export function RelativeTime({ time, prefix }: Props) {
  return time ? (
    <Text size="1" css={{ color: '$gray11' }}>
      {prefix}{' '}
      {formatDistance(parseISO(new Date(time).toISOString()), new Date(), {
        addSuffix: true,
      })}
    </Text>
  ) : null
}
