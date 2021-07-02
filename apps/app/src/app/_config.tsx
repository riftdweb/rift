import { IdProvider } from '@radix-ui/react-id'
import { getCssString } from '@riftdweb/design-system'
import Helmet from 'react-helmet'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Init } from '../components/Init'
import { DesignSystemProvider } from '../components/_layout/DesignSystemProvider'
import '../styles.css'
import '../toast.css'
import { Providers } from './_providers'
import { Root } from './_root'

export function Config({ children }) {
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
              {children}
            </Providers>
          </Root>
        </IdProvider>
      </div>
    </DesignSystemProvider>
  )
}
