import { Button } from '@riftdweb/design-system'
import { useProfile } from '../../../../hooks/useProfile'
import { useUsers } from '../../../../hooks/users'
import { User } from '../User'

type Props = {
  userId: string
}

export function SuggestedFollow({ userId }: Props) {
  const { handleFollow } = useUsers()
  const profile = useProfile(userId)
  return (
    <User userId={userId} profile={profile}>
      <Button onClick={() => handleFollow(userId, profile)}>Follow</Button>
    </User>
  )
}
