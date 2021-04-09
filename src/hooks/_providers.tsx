import dynamic from 'next/dynamic'
import { SeedsProvider } from './useSeeds'
import { SkyfilesProvider } from './useSkyfiles'

// const UploadsProvider = dynamic(() => import('../hooks/UploadsProvider'), {
//   ssr: false,
// })

export function Providers({ children }) {
  return (
    <SeedsProvider>
      <SkyfilesProvider>{children}</SkyfilesProvider>
    </SeedsProvider>
  )
}
