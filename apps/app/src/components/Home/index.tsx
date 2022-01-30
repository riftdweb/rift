import { LoadingState } from '@riftdweb/core'
import { useAccount } from '@riftdweb/core/src/hooks/useAccount'
import { Landing } from '../Landing'
import { SocialHome } from '../Social/Home'

export function Home() {
  const { myUserId, isReady } = useAccount()
  console.log('home', myUserId)
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
