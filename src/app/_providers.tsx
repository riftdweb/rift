import { useSkynet } from '../hooks/skynet'
import { DomainsProvider } from '../hooks/domains'
import { AppsProvider } from '../hooks/useApps'
import { SkyfilesProvider } from '../hooks/useSkyfiles'
import { DnsProvider } from '../hooks/useDns'

export function Providers({ children }) {
  const { isInitializing } = useSkynet()

  // Do not init other providers until mySky has initialized
  // This way if user is already logged in local data does not load first
  if (isInitializing) {
    return null
  }

  return (
    <AppsProvider>
      <DomainsProvider>
        <DnsProvider>
          <SkyfilesProvider>{children}</SkyfilesProvider>
        </DnsProvider>
      </DomainsProvider>
    </AppsProvider>
  )
}
