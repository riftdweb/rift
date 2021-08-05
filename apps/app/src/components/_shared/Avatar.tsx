import { Avatar as DAvatar } from '@riftdweb/design-system'
import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { useAvatarUrl } from '../../hooks/useAvatarUrl'
import { Link } from './Link'

type Props = {
  userId: string
  link?: boolean
  profile?: IUserProfile
  size?: '1' | '2' | '3'
}

export function Avatar({ userId, profile, link = false, size = '2' }: Props) {
  const avatarUrl = useAvatarUrl(profile)

  const avatar = (
    <DAvatar
      size={size}
      src={avatarUrl}
      title={profile?.username}
      interactive={link}
    />
  )

  if (link) {
    return (
      <Link
        css={{
          color: '$hiContrast',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        to={`/users/${userId}`}
      >
        {avatar}
      </Link>
    )
  }

  return avatar
}
