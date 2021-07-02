import { DomainsProvider } from '../hooks/domains'
import { FeedProvider } from '../hooks/feed'
import { useSkynet } from '../hooks/skynet'
import { UsersProvider } from '../hooks/users'
import { AppsProvider } from '../hooks/useApps'
import { DnsProvider } from '../hooks/useDns'
import { SkyfilesProvider } from '../hooks/useSkyfiles'
import { ThemeProvider } from '../hooks/theme'

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
            <UsersProvider>
              <FeedProvider>
                <SkyfilesProvider>{children}</SkyfilesProvider>
              </FeedProvider>
            </UsersProvider>
          </DnsProvider>
        </DomainsProvider>
      </AppsProvider>
    </ThemeProvider>
  )
}
