import { Box, Flex, Heading } from '@modulz/design-system'
import { GearIcon } from '@radix-ui/react-icons'
import { Link } from '../../_shared/Link'

type Props = {}

export function Nav({}: Props) {
  return (
    <Heading css={{ my: '$5' }}>
      <Flex css={{ gap: '$1', alignItems: 'center', height: '30px' }}>
        <Link to="/news">News</Link>
        <Box css={{ flex: 1 }} />
        <Link to="/news/insights">
          <Box css={{ mr: '$1' }}>
            <GearIcon />
          </Box>
        </Link>
      </Flex>
    </Heading>
  )
}
