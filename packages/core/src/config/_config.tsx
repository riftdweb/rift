import React, { useMemo } from 'react'
import { getCssText } from '@riftdweb/design-system'
import Helmet from 'react-helmet'
import { ToastContainer } from 'react-toastify'
import {
  globalNormalizeStyles,
  globalToastStyles,
  globalToastCustomStyles,
} from './_styles'

export function Config({ name, children, providers }) {
  globalNormalizeStyles()
  globalToastStyles()
  globalToastCustomStyles()

  const Providers = useMemo(
    () => () =>
      providers
        .slice()
        .reverse()
        .reduce((el, Provider) => <Provider>{el}</Provider>, children),
    [providers, children]
  )

  return (
    <div>
      <Helmet>
        <title>{name}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style
          id="stitches"
          dangerouslySetInnerHTML={{ __html: getCssText() }}
        />
      </Helmet>
      <ToastContainer />
      <Providers />
    </div>
  )
}
