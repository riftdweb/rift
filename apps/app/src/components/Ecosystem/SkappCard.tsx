import { LockClosedIcon, LockOpen2Icon } from '@radix-ui/react-icons'
import {
  Badge,
  Box,
  Card,
  Code,
  Flex,
  Heading,
  Text,
  Tooltip,
} from '@riftdweb/design-system'
import { App } from '@riftdweb/types'

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
          <Heading
            size="1"
            css={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </Heading>
          <Box css={{ flex: 1 }} />
          {/* <Link href={`/apps/${id}`}> */}
          <Tooltip content="The ability to lock app versions is coming soon">
            <Box
              css={{
                color: lockedOn ? '$gray11' : '$gray7',
                '&:hover': { color: '$gray10' },
              }}
            >
              {lockedOn ? <LockClosedIcon /> : <LockOpen2Icon />}
            </Box>
          </Tooltip>
          {/* </Link> */}
        </Flex>
        <Flex css={{ ai: 'center', my: '$2' }}>
          <Code>{hnsDomain}</Code>
        </Flex>
        <Text size="3" css={{ color: '$slate10', lineHeight: '23px' }}>
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
