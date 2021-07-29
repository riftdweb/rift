import { SkynetProvider } from '../contexts/skynet'

export function Root({ children }) {
  return <SkynetProvider>{children}</SkynetProvider>
}
