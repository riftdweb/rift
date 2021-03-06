import React, { Suspense } from 'react'
import { HashRouter as Router } from 'react-router-dom'
import { LayoutApp, LoadingState } from '../components'
import { Config } from './_config'

export function App({ name, providers, children }) {
  return (
    <Router>
      <Config name={name} providers={providers}>
        <LayoutApp>
          <Suspense
            fallback={
              <LoadingState
                color="$gray7"
                css={{
                  margin: '200px auto',
                }}
              />
            }
          >
            {children}
          </Suspense>
        </LayoutApp>
      </Config>
    </Router>
  )
}
