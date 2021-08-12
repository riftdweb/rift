import { useUser } from '../../../../hooks/useProfile'
import { UserContextMenu } from '../../../_shared/UserContextMenu'
import { User } from '../../../_shared/User'

type Props = {
  userId: string
}

export function Follow({ userId }: Props) {
  const user = useUser(userId)
  const profile = user?.profile
  return (
    <User userId={userId}>
      <UserContextMenu userId={userId} />
    </User>
  )
}
