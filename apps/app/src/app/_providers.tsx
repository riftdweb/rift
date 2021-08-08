import { DomainsProvider } from '../contexts/domains'
import { FeedProvider } from '../contexts/feed'
import { useSkynet } from '../contexts/skynet'
import { UsersProvider } from '../contexts/users'
import { AppsProvider } from '../contexts/apps'
import { DnsProvider } from '../contexts/dns'
import { SkyfilesProvider } from '../contexts/skyfiles'
import { ThemeProvider } from '../contexts/theme'
import { SearchProvider } from '../contexts/search'
import { FsProvider } from '../contexts/files'

export function Providers({ children }) {
  const { isInitializing } = useSkynet()

  // Do not init other providers until mySky has initialized
  // This way if user is already logged in local data does not load first
  if (isInitializing) {
    return null
  }

  return (
    <ThemeProvider>
      <AppsProvider>
        <DomainsProvider>
          <DnsProvider>
            <FsProvider>
              <UsersProvider>
                <SearchProvider>
                  <FeedProvider>
                    <SkyfilesProvider>{children}</SkyfilesProvider>
                  </FeedProvider>
                </SearchProvider>
              </UsersProvider>
            </FsProvider>
          </DnsProvider>
        </DomainsProvider>
      </AppsProvider>
    </ThemeProvider>
  )
}
