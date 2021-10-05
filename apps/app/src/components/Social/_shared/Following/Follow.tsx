import { UserContextMenu } from '@riftdweb/core/src/components/_shared/UserContextMenu'
import { User } from '@riftdweb/core/src/components/_shared/User'

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
