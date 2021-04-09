import dynamic from 'next/dynamic'
import { SeedsProvider } from './useSeeds'
import { AppsProvider } from './useApps'
import { SkyfilesProvider } from './useSkyfiles'

// const UploadsProvider = dynamic(() => import('../hooks/UploadsProvider'), {
//   ssr: false,
// })

export function Providers({ children }) {
  return (
    <AppsProvider>
      <SeedsProvider>
        <SkyfilesProvider>{children}</SkyfilesProvider>
      </SeedsProvider>
    </AppsProvider>
  )
}
