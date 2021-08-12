import { Button } from '@riftdweb/design-system'
import { useUser } from '../../../../hooks/useProfile'
import { useUsers } from '../../../../contexts/users'
import { User } from '../../../_shared/User'

type Props = {
  userId: string
}

export function SuggestedFollow({ userId }: Props) {
  const { handleFollow } = useUsers()
  const user = useUser(userId)
  return (
    <User userId={userId}>
      <Button onClick={() => handleFollow(userId, user.profile)}>Follow</Button>
    </User>
  )
}
