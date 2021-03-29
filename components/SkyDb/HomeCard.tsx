import { Badge, Box, Card, Subheading, Tooltip } from '@modulz/design-system'
import Link from 'next/link'
import { useSeedKeys } from '../../hooks/useSeedKeys'

type Props = {
  seed: string
}

export function HomeCard({ seed }) {
  const { keys } = useSeedKeys(seed)
  return (
    <Box
      css={{
        overflow: 'hidden'
      }}>
      <Link
        passHref
        href={`/skydb/${seed}`}>
        <Card
          as="a"
          css={{
            p: '$3',
          }}
          variant="interactive">
          <Subheading
            css={{
              my: '$2',
              width: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
            {seed}
          </Subheading>
          <Tooltip content={`Currently tracking ${keys.length} data keys`}>
            <Badge
              size="1"
              key={seed}>{keys.length} data keys</Badge>
          </Tooltip>
        </Card>
      </Link>
    </Box>
  )
}
