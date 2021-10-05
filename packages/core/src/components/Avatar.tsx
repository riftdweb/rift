import { Avatar as DAvatar } from '@riftdweb/design-system'
import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { useAvatarUrl } from '../hooks/useAvatarUrl'
import { Link } from './Link'

type Props = {
  userId: string
  link?: boolean
  profile?: IUserProfile
  size?: '1' | '2' | '3'
  color?: string
}

export function Avatar({
  userId,
  profile,
  link = false,
  color,
  size = '2',
}: Props) {
  const avatarUrl = useAvatarUrl(profile)

  const avatar = (
    <DAvatar
      size={size}
      src={avatarUrl}
      title={profile?.username}
      interactive={link}
      css={{
        borderRadius: '100%',
        border: color ? `2px solid $${color}` : 'inherit',
      }}
    />
  )

  if (link) {
    return <Link to={`/users/${userId}`}>{avatar}</Link>
  }

  return avatar
}
