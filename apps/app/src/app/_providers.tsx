import { DomainsProvider } from '../contexts/domains'
import { FeedProvider } from '../contexts/feed'
import { UsersProvider } from '../contexts/users'
import { AppsProvider } from '../contexts/apps'
import { DnsProvider } from '../contexts/dns'
import { SkyfilesProvider } from '../contexts/skyfiles'
import { ThemeProvider } from '../contexts/theme'
import { SearchProvider } from '../contexts/search'
import { DocsProvider } from '../contexts/docs'
// import { FsProvider } from '../contexts/files'

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AppsProvider>
        <DomainsProvider>
          <DnsProvider>
            <DocsProvider>
              <UsersProvider>
                <SearchProvider>
                  <FeedProvider>
                    <SkyfilesProvider>{children}</SkyfilesProvider>
                  </FeedProvider>
                </SearchProvider>
              </UsersProvider>
              {/* <FsProvider>
            </FsProvider> */}
            </DocsProvider>
          </DnsProvider>
        </DomainsProvider>
      </AppsProvider>
    </ThemeProvider>
  )
}
