import { Container, Box, Flex } from '@riftdweb/design-system'
import { Following } from './_shared/Following'
import { Activity } from './_shared/Activity'

type Props = {
  overflow?: 'hidden' | 'visible'
  children: React.ReactNode
}

export function Layout({ children, overflow = 'visible' }: Props) {
  return (
    <Container css={{ py: '$3', position: 'relative' }}>
      <Flex
        css={{
          position: 'relative',
          gap: '$3',
          justifyContent: 'space-between',
          '@bp2': {
            gap: '$5',
          },
        }}
      >
        <Box
          css={{
            display: 'none',
            '@bp2': {
              display: 'block',
              width: '200px',
            },
            '@bp3': {
              width: '300px',
            },
          }}
        >
          <Following />
        </Box>
        <Flex
          css={{
            flex: 1,
            flexDirection: 'column',
            margin: '$3 -$1',
            padding: '0 $1',
            zIndex: 1,
            overflow,
            maxWidth: '800px',
          }}
        >
          {children}
        </Flex>
        <Box
          css={{
            display: 'none',
            marginLeft: '$3',
            '@bp3': {
              display: 'block',
              width: '250px',
            },
          }}
        >
          <Activity />
        </Box>
      </Flex>
    </Container>
  )
}
