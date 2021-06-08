import { Button } from '@riftdweb/design-system'
import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { User } from '../User'

type Props = {
  userId: string
  profile: IUserProfile
  handleFollow: (username: string, userId: string) => void
}

export function SuggestedFollow({ profile, userId, handleFollow }: Props) {
  return (
    <User userId={userId} profile={profile}>
      <Button onClick={() => handleFollow(profile.username, userId)}>
        Follow
      </Button>
    </User>
  )
}
