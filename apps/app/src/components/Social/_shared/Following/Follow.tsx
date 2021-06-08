import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { UserContextMenu } from '../../../_shared/UserContextMenu'
import { User } from '../User'

type Props = {
  userId: string
  profile: IUserProfile
  handleUnfollow?: (userId: string) => void
}

export function Follow({ profile, userId, handleUnfollow }: Props) {
  return (
    <User userId={userId} profile={profile}>
      {/* <Link to={`/data/mysky/${userId}/profile-dac.hns/profileIndex.json`}>
        Data
      </Link> */}
      <UserContextMenu
        userId={userId}
        profile={profile}
        handleUnfollow={handleUnfollow}
      />
    </User>
  )
}
