import {
  App,
  ThemeProvider,
  DomainsProvider,
  DnsProvider,
  DocsProvider,
  FsProvider,
  SearchProvider,
  SkyfilesProvider,
  startRoot,
} from '@riftdweb/core'
import { DesignSystemProvider } from '@riftdweb/design-system'
import { AppRoutes } from './_routes'

const providers = [
  DesignSystemProvider,
  ThemeProvider,
  // DomainsProvider,
  // DnsProvider,
  // DocsProvider,
  // FsProvider,
  // SearchProvider,
  // SkyfilesProvider,
]

export function Rift() {
  return (
    <App name="Rift" providers={providers}>
      <AppRoutes />
    </App>
  )
}
