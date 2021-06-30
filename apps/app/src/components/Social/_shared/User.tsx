import { Flex } from '@riftdweb/design-system'
import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { Link } from '../../_shared/Link'
import { Avatar } from '../../_shared/Avatar'

type Props = {
  userId: string
  profile?: IUserProfile
  children?: React.ReactNode
  size?: string
}

export function User({ userId, profile, size = '2', children }: Props) {
  return (
    <Flex
      css={{
        alignItems: 'center',
        gap: '$1',
        width: '200px',
      }}
    >
      <Avatar size={size} profile={profile} />
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
        {profile?.username || profile?.firstName || `${userId.slice(0, 5)}...`}
      </Link>
      {children}
    </Flex>
  )
}
