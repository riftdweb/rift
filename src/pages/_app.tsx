import { Box, Container, darkTheme } from '@modulz/design-system'
import { IdProvider } from '@radix-ui/react-id'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useCallback, useEffect } from 'react'
import useLocalStorageState from 'use-local-storage-state'
import { DesignSystemProvider } from '../components/_layout/DesignSystemProvider'
import Footer from '../components/_layout/Footer'
import { TabNav } from '../components/_layout/TabNav'
import { Providers } from '../hooks/_providers'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '../styles.css'
import '../toast.css'

const Navbar = dynamic(() => import('../components/_layout/Navbar'), {
  ssr: false,
})

// function SafeHydrate({ children }) {
//   return (
//     <div suppressHydrationWarning>
//       {typeof window === 'undefined' ? null : children}
//     </div>
//   )
// }

function App({ Component, pageProps }) {
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

  // const [uploads, setUploads] = useUploads()

  // // Clean stale uploads on app load
  // useEffect(() => {
  //   const cleanUploads = uploads.filter(
  //     (upload) => upload.status === 'complete'
  //   )
  //   setUploads(cleanUploads)
  // }, [])

  return (
    <DesignSystemProvider>
      <div>
        <Head>
          <title>Rift</title>
          <link rel="icon" href="/favicon.ico" />
          <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
          {/* <link rel="stylesheet" href="https://develop.modulz.app/fonts/fonts.css" /> */}
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>
        <IdProvider>
          <Providers>
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
                <Component {...pageProps} />
              </Container>
              <Footer />
            </Box>
          </Providers>
        </IdProvider>
      </div>
    </DesignSystemProvider>
  )
}

export default App
