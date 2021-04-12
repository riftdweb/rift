import { SkynetProvider } from './skynet'

export function Root({ children }) {
  return <SkynetProvider>{children}</SkynetProvider>
}
