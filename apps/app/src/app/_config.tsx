import { IdProvider } from '@radix-ui/react-id'
import {
  Box,
  Container,
  darkTheme,
  getCssString,
} from '@riftdweb/design-system'
import { useCallback, useEffect } from 'react'
import Helmet from 'react-helmet'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useLocalStorageState from 'use-local-storage-state'
import { Init } from '../components/Init'
import { DesignSystemProvider } from '../components/_layout/DesignSystemProvider'
import Footer from '../components/_layout/Footer'
import Navbar from '../components/_layout/Navbar'
import { TabNav } from '../components/_layout/TabNav'
import '../styles.css'
import '../toast.css'
import { Providers } from './_providers'
import { Root } from './_root'

export function Config({ children }) {
  const [themeConfig, setThemeConfig] = useLocalStorageState('v0/themeConfig', {
    theme: 'dark-theme',
  })

  useEffect(() => {
    document.body.className = ''
    document.body.classList.add(
      themeConfig.theme === 'theme-default' ? 'theme-default' : darkTheme
    )
  }, [themeConfig])

  const toggleTheme = useCallback(() => {
    setThemeConfig({
      theme:
        themeConfig.theme === 'theme-default' ? 'dark-theme' : 'theme-default',
    })
  }, [themeConfig, setThemeConfig])

  return (
    <DesignSystemProvider>
      <div>
        <Helmet>
          <title>Rift</title>
          <link rel="icon" href="/favicon.ico" />
          <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
          {/* <link rel="stylesheet" href="https://develop.modulz.app/fonts/fonts.css" /> */}
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <style
            id="stitches"
            dangerouslySetInnerHTML={{ __html: getCssString() }}
          />
        </Helmet>
        <IdProvider>
          <Root>
            <Providers>
              <Init />
              <ToastContainer />
              <Box
                css={{
                  bc: '$loContrast',
                  height: '100vh',
                  overflowY: 'auto',
                }}
              >
                <Navbar toggleTheme={toggleTheme} />
                <Container
                  size="3"
                  css={{ minHeight: '60vh', marginTop: '20px' }}
                >
                  <TabNav />
                  {children}
                </Container>
                <Footer />
              </Box>
            </Providers>
          </Root>
        </IdProvider>
      </div>
    </DesignSystemProvider>
  )
}
