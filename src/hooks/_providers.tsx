import dynamic from 'next/dynamic'
import { SeedsProvider } from './useSeeds'
import { UploadsProvider } from './useUploads'

// const UploadsProvider = dynamic(() => import('../hooks/UploadsProvider'), {
//   ssr: false,
// })

export function Providers({ children }) {
  return (
    <SeedsProvider>
      <UploadsProvider>{children}</UploadsProvider>
    </SeedsProvider>
  )
}
