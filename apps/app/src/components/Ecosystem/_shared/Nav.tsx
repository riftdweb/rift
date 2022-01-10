import { Box, Flex, Heading, Text } from '@riftdweb/design-system'
import { App } from '@riftdweb/types'
import { Link } from '@riftdweb/core'

type Props = {
  app?: App
}

export function Nav({ app }: Props) {
  return (
    <Heading css={{ my: '$5' }}>
      <Flex css={{ gap: '$1', alignItems: 'center', height: '30px' }}>
        <Link to="/">Apps</Link>
        {app && <Text>/</Text>}
        {app && (
          <Link
            css={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            to={`/apps/${app.id}`}
          >
            {app.name}
          </Link>
        )}
        {!app && <Box css={{ flex: 1 }} />}
      </Flex>
    </Heading>
  )
}
