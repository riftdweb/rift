import { Avatar as DAvatar } from '@riftdweb/design-system'
import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { useAvatarUrl } from '../../hooks/useAvatarUrl'

type Props = {
  profile?: IUserProfile
  size?: string
}

export function Avatar({ profile, size = '2' }: Props) {
  const avatarUrl = useAvatarUrl(profile)
  return <DAvatar size={size} src={avatarUrl} />
}
