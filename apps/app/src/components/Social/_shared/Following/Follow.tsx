import { UserContextMenu } from '../../../_shared/UserContextMenu'
import { User } from '../../../_shared/User'

type Props = {
  userId: string
}

export function Follow({ userId }: Props) {
  return (
    <User userId={userId} width="inherit">
      <UserContextMenu userId={userId} />
    </User>
  )
}
