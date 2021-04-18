import { SkynetProvider } from '../hooks/skynet'

export function Root({ children }) {
  return <SkynetProvider>{children}</SkynetProvider>
}
