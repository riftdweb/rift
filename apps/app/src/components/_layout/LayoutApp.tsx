import { Box, Container } from '@riftdweb/design-system'
import Footer from './Footer'
import Navbar from './Navbar'
import { TabNav } from './TabNav'

type Props = {
  children: React.ReactNode
}

export function LayoutApp({ children }: Props) {
  return (
    <Box
      css={{
        bc: '$loContrast',
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      <Navbar />
      <Container size="3" css={{ minHeight: '60vh', marginTop: '20px' }}>
        <TabNav />
        {children}
      </Container>
      <Footer />
    </Box>
  )
}
