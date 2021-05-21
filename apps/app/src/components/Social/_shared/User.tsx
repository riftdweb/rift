import { Avatar, Box, Flex } from '@riftdweb/design-system'
import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { useAvatarUrl } from '../../../hooks/useAvatarUrl'
import { Link } from '../../_shared/Link'

type Props = {
  userId: string
  profile?: IUserProfile
  children?: React.ReactNode
  size?: string
}

export function User({ userId, profile, size = '2', children }: Props) {
  const avatarUrl = useAvatarUrl(profile)
  return (
    <Flex
      css={{
        alignItems: 'center',
        gap: '$1',
      }}
    >
      <Avatar size={size} src={avatarUrl} />
      <Link
        css={{
          color: '$hiContrast',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
        to={`/users/${userId}`}
      >
        {profile ? profile.username : ''}
      </Link>
      {children}
    </Flex>
  )
}
