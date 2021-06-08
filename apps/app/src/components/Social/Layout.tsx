import { Box, Flex } from '@riftdweb/design-system'
import { Following } from './_shared/Following'
import { Activity } from './_shared/Activity'

type Props = {
  overflow?: 'hidden' | 'visible'
  children: React.ReactNode
}

export function Layout({ children, overflow = 'hidden' }: Props) {
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
              my: '$3',
              overflow,
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
