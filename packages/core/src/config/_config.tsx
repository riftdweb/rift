import { getCssString } from '@riftdweb/design-system'
import Helmet from 'react-helmet'
import { ToastContainer } from 'react-toastify'
import { Providers } from './_providers'
import './_styles'

export function Config({ name, children }) {
  return (
    <div>
      <Helmet>
        <title>{name}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        {/* <link rel="stylesheet" href="https://develop.modulz.app/fonts/fonts.css" /> */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style
          id="stitches"
          dangerouslySetInnerHTML={{ __html: getCssString() }}
        />
      </Helmet>
      <ToastContainer />
      <Providers>{children}</Providers>
    </div>
  )
}
