import { Button } from '@riftdweb/design-system'
import { User } from '@riftdweb/core'
import { handleFollow } from '@riftdweb/core/src/services/users'

type Props = {
  userId: string
}

export function SuggestedFollow({ userId }: Props) {
  return (
    <User userId={userId} width="100%">
      <Button onClick={() => handleFollow(userId)}>Follow</Button>
    </User>
  )
}
