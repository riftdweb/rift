import { Button } from '@riftdweb/design-system'
import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { useUsers } from '../../../../hooks/users'
import { User } from '../User'

type Props = {
  userId: string
  profile: IUserProfile
}

export function SuggestedFollow({ profile, userId }: Props) {
  const { handleFollow } = useUsers()
  return (
    <User userId={userId} profile={profile}>
      <Button onClick={() => handleFollow(userId, profile)}>Follow</Button>
    </User>
  )
}
