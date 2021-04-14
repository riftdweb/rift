import { useSkynet } from './skynet'
import { DomainsProvider } from './domains'
import { AppsProvider } from './useApps'
import { SkyfilesProvider } from './useSkyfiles'

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
        <SkyfilesProvider>{children}</SkyfilesProvider>
      </DomainsProvider>
    </AppsProvider>
  )
}
