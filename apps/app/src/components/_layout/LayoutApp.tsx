import { Box, Container } from '@riftdweb/design-system'
import { Route, Switch } from 'react-router-dom'
import { useSkynet } from '../../contexts/skynet'
import Footer from './Footer'
import Navbar from './Navbar'
import { TabNav } from './TabNav'

type Props = {
  children: React.ReactNode
}

export function LayoutApp({ children }: Props) {
  const { myUserId, isReady } = useSkynet()

  return (
    <Box
      id="main-container"
      css={{
        bc: '$loContrast',
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      <Navbar />
      <Container
        size="4"
        css={{ minHeight: '60vh', marginTop: '20px', padding: 0 }}
      >
        <Switch>
          <Route path="/" exact>
            {isReady && myUserId && <TabNav />}
          </Route>
          <Route path="/*">
            <TabNav />
          </Route>
        </Switch>
        {children}
      </Container>
      <Footer />
    </Box>
  )
}
