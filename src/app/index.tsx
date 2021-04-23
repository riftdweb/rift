import { Box } from '@modulz/design-system'
import React, { Suspense, lazy } from 'react'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import SpinnerIcon from '../components/_icons/SpinnerIcon'
import { Config } from './_config'

// import Home from '../pages/Home'
// import News from '../pages/News'
// import Skyfiles from '../pages/Skyfiles'
// import Data from '../pages/Data'
// import Tools from '../pages/Tools'
// import Settings from '../pages/Settings'
const Home = lazy(() => import('../pages/Home'))
const NewsFeed = lazy(() => import('../pages/NewsFeed'))
const NewsInsights = lazy(() => import('../pages/NewsInsights'))
const Skyfiles = lazy(() => import('../pages/Skyfiles'))
const Data = lazy(() => import('../pages/Data'))
const Dns = lazy(() => import('../pages/Dns'))
const Tools = lazy(() => import('../pages/Tools'))
const Settings = lazy(() => import('../pages/Settings'))

export function App() {
  return (
    <Router>
      <Config>
        <Suspense
          fallback={
            <Box
              css={{
                display: 'flex',
                height: '200px',
              }}
            >
              <Box
                css={{
                  margin: 'auto',
                  color: '$gray600',
                }}
              >
                <SpinnerIcon />
              </Box>
            </Box>
          }
        >
          <Switch>
            <Route path="/files">
              <Skyfiles />
            </Route>
            <Route path="/data/:domainName/:dataKeyName">
              <Data />
            </Route>
            <Route path="/data">
              <Data />
            </Route>
            <Route path="/dns/:id">
              <Dns />
            </Route>
            <Route path="/dns">
              <Dns />
            </Route>
            <Route path="/tools">
              <Tools />
            </Route>
            <Route path="/settings">
              <Settings />
            </Route>
            <Route path="/news/insights">
              <NewsInsights />
            </Route>
            <Route path="/news">
              <NewsFeed />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </Suspense>
      </Config>
    </Router>
  )
}
