import { useCallback, useEffect } from 'react';
import Head from 'next/head';
import '../styles.css';
import { Box, Container, darkTheme } from '@modulz/design-system';
import { DesignSystemProvider } from '../components/_layout/DesignSystemProvider';
import Footer from '../components/_layout/Footer';
import { IdProvider } from '@radix-ui/react-id';
import { TabNav } from '../components/_layout/TabNav';
import dynamic from 'next/dynamic';
import useLocalStorageState from 'use-local-storage-state';

const Navbar = dynamic(() => import('../components/_layout/Navbar'), {
  ssr: false,
})

function SafeHydrate({ children }) {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : children}
    </div>
  )
}

function App({ Component, pageProps }) {
  const [themeConfig, setThemeConfig] = useLocalStorageState('v0/themeConfig', { theme: 'dark-theme' });

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(themeConfig.theme === 'theme-default' ? 'theme-default' : darkTheme);
  }, [themeConfig]);

  const toggleTheme = useCallback(() => {
    setThemeConfig({
      theme: themeConfig.theme === 'theme-default' ? 'dark-theme': 'theme-default'
    })
  }, [themeConfig, setThemeConfig])

  return (
    <DesignSystemProvider>
      <div>
        <Head>
          <title>Rift</title>
          <link rel="icon" href="/favicon.ico" />
          {/* <link rel="stylesheet" href="https://develop.modulz.app/fonts/fonts.css" /> */}
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <IdProvider>
          <Box
            css={{
            bc: '$loContrast',
            height: '100vh',
            overflowY: 'auto',
          }}>
            <Navbar toggleTheme={toggleTheme} />
            <Container size="3" css={{ minHeight: '60vh', marginTop: '20px' }}>
              <TabNav />
              <SafeHydrate><Component {...pageProps} /></SafeHydrate>
            </Container>
            <Footer />
          </Box>
        </IdProvider>
      </div>
    </DesignSystemProvider>
  );
}

export default App;
