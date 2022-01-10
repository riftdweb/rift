import {
  App,
  SkynetProvider,
  ThemeProvider,
  AppsProvider,
  DomainsProvider,
  DnsProvider,
  DocsProvider,
  UsersProvider,
  FsProvider,
  SearchProvider,
  FeedProvider,
  SkyfilesProvider,
  startRoot,
} from '@riftdweb/core'
import { DesignSystemProvider } from '@riftdweb/design-system'
import { useEffect } from 'react'
import { AppRoutes } from './_routes'

const providers = [
  DesignSystemProvider,
  ThemeProvider,
  // SkynetProvider,
  // AppsProvider,
  // DomainsProvider,
  // DnsProvider,
  // DocsProvider,
  // UsersProvider,
  // FsProvider,
  // SearchProvider,
  // FeedProvider,
  // SkyfilesProvider,
]

export function Rift() {
  return (
    <App name="Rift" providers={providers}>
      <AppRoutes />
    </App>
  )
}
