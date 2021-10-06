import { lazy } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { DATA_BASE_PATH, DATA_MYSKY_BASE_PATH } from '@riftdweb/core'

const Home = lazy(() => import('./pages/Home'))
const SocialProfile = lazy(() => import('./pages/SocialProfile'))
const FeedInsights = lazy(() => import('./pages/FeedInsights'))
const Skyfiles = lazy(() => import('./pages/Skyfiles'))
// const Files = lazy(() => import('../pages/Files'))
const Docs = lazy(() => import('./pages/Docs'))
const Data = lazy(() => import('./pages/Data'))
const Dns = lazy(() => import('./pages/Dns'))
const Tools = lazy(() => import('./pages/Tools'))
const Ecosystem = lazy(() => import('./pages/Ecosystem'))
const Settings = lazy(() => import('./pages/Settings'))
const Dev = lazy(() => import('./pages/Dev'))
const Landing = lazy(() => import('./pages/Landing'))

export function AppRoutes() {
  return (
    <Switch>
      <Route path="/docs/:docId">
        <Docs />
      </Route>
      <Route path="/docs">
        <Docs />
      </Route>
      <Route path="/uploads">
        <Skyfiles />
      </Route>
      {/* <Route path="/files/*">
                <Files />
              </Route>
              <Route path="/files">
                <Files />
              </Route> */}
      <Route path={`${DATA_MYSKY_BASE_PATH}/:viewingUserId/:domainName/*`}>
        <Data />
      </Route>
      <Route path={`${DATA_MYSKY_BASE_PATH}/:viewingUserId`}>
        <Data />
      </Route>
      <Route path={DATA_MYSKY_BASE_PATH}>
        <Data />
      </Route>
      <Redirect from={DATA_BASE_PATH} to={DATA_MYSKY_BASE_PATH} />
      <Route path="/dns/:id">
        <Dns />
      </Route>
      <Route path="/dns">
        <Dns />
      </Route>
      <Route path="/tools">
        <Tools />
      </Route>
      <Route path="/dev/:toolName">
        <Dev />
      </Route>
      <Route path="/settings">
        <Settings />
      </Route>
      <Route path="/feed/top/insights">
        <FeedInsights />
      </Route>
      <Route path="/users/:userId">
        <SocialProfile />
      </Route>
      <Route path="/ecosystem">
        <Ecosystem />
      </Route>
      <Route exact path="/landing">
        <Landing />
      </Route>
      <Route exact path="/">
        <Home />
      </Route>
      <Redirect from="/*" to="/" />
    </Switch>
  )
}
