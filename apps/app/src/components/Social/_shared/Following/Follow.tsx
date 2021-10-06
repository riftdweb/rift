import { UserContextMenu } from '@riftdweb/core'
import { User } from '@riftdweb/core'

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
