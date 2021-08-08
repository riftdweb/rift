import { Box, Container } from '@riftdweb/design-system'
import Footer from './Footer'
import Navbar from './Navbar'
// import { TabNav } from '../components/_layout/TabNav'

type Props = {
  children: React.ReactNode
}

export function LayoutLanding({ children }: Props) {
  return (
    <Box
      css={{
        bc: '$loContrast',
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      <Navbar />
      <Box css={{ minHeight: '60vh', marginTop: '20px' }}>
        {/* <TabNav /> */}
        {children}
      </Box>
      <Footer />
    </Box>
  )
}
