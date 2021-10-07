import {
  App,
  SkynetProvider,
  ThemeProvider,
  AppsProvider,
  DomainsProvider,
  DnsProvider,
  DocsProvider,
  UsersProvider,
  // FsProvider,
  SearchProvider,
  FeedProvider,
  SkyfilesProvider,
} from '@riftdweb/core'
import { DesignSystemProvider } from '@riftdweb/design-system'
import { AppRoutes } from './_routes'

const providers = [
  DesignSystemProvider,
  SkynetProvider,
  ThemeProvider,
  AppsProvider,
  DomainsProvider,
  DnsProvider,
  DocsProvider,
  UsersProvider,
  // FsProvider,
  SearchProvider,
  FeedProvider,
  SkyfilesProvider,
]

export function Rift() {
  return (
    <App name="Rift" providers={providers}>
      <AppRoutes />
    </App>
  )
}
