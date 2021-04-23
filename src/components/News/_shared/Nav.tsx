import { Box, Flex, Heading } from '@modulz/design-system'
import { Link } from '../../_shared/Link'

type Props = {}

export function Nav({}: Props) {
  return (
    <Heading css={{ my: '$5' }}>
      <Flex css={{ gap: '$1', alignItems: 'center', height: '30px' }}>
        <Link to="/">News</Link>
        <Box css={{ flex: 1 }} />
      </Flex>
    </Heading>
  )
}
