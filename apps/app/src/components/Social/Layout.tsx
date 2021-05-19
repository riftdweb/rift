import { Box, Flex } from '@riftdweb/design-system'
import { Nav } from './_shared/Nav'
import { Following } from './_shared/Following'
import { Activity } from './_shared/Activity'

type Props = {
  children: React.ReactNode
}

export function Layout({ children }: Props) {
  return (
    <Box css={{ py: '$3', position: 'relative' }}>
      <Box>
        <Flex css={{ gap: '$5', position: 'relative' }}>
          <Box>
            <Following />
          </Box>
          <Flex
            css={{
              flex: 1,
              flexDirection: 'column',
              gap: '$5',
              my: '$3',
              overflow: 'hidden',
            }}
          >
            {children}
          </Flex>
          <Box>
            <Activity />
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}
