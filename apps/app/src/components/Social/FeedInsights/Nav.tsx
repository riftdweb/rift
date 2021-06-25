import { Box, Flex, Heading, Text } from '@riftdweb/design-system'
import { Link } from '../../_shared/Link'

export function Nav() {
  return (
    <Heading>
      <Flex css={{ gap: '$1', alignItems: 'center', height: '30px' }}>
        <Link to="/">Feed</Link>
        <Text>/</Text>
        <Link to="/">Top</Link>
        <Text>/</Text>
        <Link to="/feed/top/insights">Algorithm</Link>
        <Box css={{ flex: 1 }} />
      </Flex>
    </Heading>
  )
}
