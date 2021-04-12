import {
  Badge,
  Box,
  Card,
  Code,
  Flex,
  Subheading,
  Text,
} from '@modulz/design-system'
import { LockClosedIcon, LockOpen2Icon } from '@radix-ui/react-icons'
import { Link } from '../_shared/Link'
import { App } from '../../shared/types'

type Props = {
  portal: string
  app: App
}

export function SkappCard({
  portal,
  app: { id, hnsDomain, name, description, lockedOn, tags },
}: Props) {
  return (
    <Box>
      <Card
        as="a"
        href={`https://${hnsDomain}.${portal}`}
        target="_blank"
        css={{ p: '$3' }}
        variant="interactive"
      >
        <Flex css={{ ai: 'center', mb: '$2' }}>
          <Subheading
            css={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </Subheading>
          <Box css={{ flex: 1 }} />
          <Link href={`/apps/${id}`}>
            <Box
              css={{
                color: lockedOn ? '$gray900' : '$gray600',
                '&:hover': { color: '$gray800' },
              }}
            >
              {lockedOn ? <LockClosedIcon /> : <LockOpen2Icon />}
            </Box>
          </Link>
        </Flex>
        <Flex css={{ ai: 'center', my: '$2' }}>
          <Code>{hnsDomain}</Code>
        </Flex>
        <Text size="3" css={{ color: '$slate900', lineHeight: '23px' }}>
          {description}
        </Text>
        <Flex css={{ ai: 'center', mt: '$3', flexWrap: 'wrap' }}>
          {tags.map((tag) => (
            <Badge key={tag} css={{ mr: '$1', mb: '$1' }}>
              {tag}
            </Badge>
          ))}
        </Flex>
      </Card>
    </Box>
  )
}
