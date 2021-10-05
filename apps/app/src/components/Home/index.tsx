import { useSkynet } from '@riftdweb/core/src/contexts/skynet'
import { Landing } from '../Landing'
import { SocialHome } from '../Social/Home'
import { LoadingState } from '@riftdweb/core/src/components/_shared/LoadingState'

export function Home() {
  const { myUserId, isReady } = useSkynet()
  if (!isReady) {
    return (
      <LoadingState
        color="$gray600"
        css={{
          margin: '200px auto',
        }}
      />
    )
  }
  return myUserId ? <SocialHome /> : <Landing />
}
