import { Button } from '@riftdweb/design-system'
import { useUsers } from '@riftdweb/core/src/contexts/users'
import { User } from '@riftdweb/core/src/components/_shared/User'

type Props = {
  userId: string
}

export function SuggestedFollow({ userId }: Props) {
  const { handleFollow } = useUsers()
  return (
    <User userId={userId} width="100%">
      <Button onClick={() => handleFollow(userId)}>Follow</Button>
    </User>
  )
}
