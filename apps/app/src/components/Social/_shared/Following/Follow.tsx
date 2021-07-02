import { useProfile } from '../../../../hooks/useProfile'
import { UserContextMenu } from '../../../_shared/UserContextMenu'
import { User } from '../User'

type Props = {
  userId: string
}

export function Follow({ userId }: Props) {
  const profile = useProfile(userId)
  return (
    <User userId={userId} profile={profile}>
      <UserContextMenu userId={userId} profile={profile} />
    </User>
  )
}
