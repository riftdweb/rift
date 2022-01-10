import { LoadingState } from '@riftdweb/core'
import { useAccount } from '@riftdweb/core/src/hooks/useAccount'
import { Landing } from '../Landing'
import { SocialHome } from '../Social/Home'

export function Home() {
  const { myUserId, isReady } = useAccount()
  if (!isReady) {
    return (
      <LoadingState
        color="$gray7"
        css={{
          margin: '200px auto',
        }}
      />
    )
  }
  return myUserId ? <SocialHome /> : <Landing />
}
