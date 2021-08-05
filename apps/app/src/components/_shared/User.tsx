import { Flex } from '@riftdweb/design-system'
import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { Link } from './Link'
import { Avatar } from './Avatar'

type Props = {
  userId: string
  profile?: IUserProfile
  children?: React.ReactNode
  width?: string
  size?: '1' | '2' | '3'
}

export function User({
  userId,
  profile,
  size = '2',
  width = '200px',
  children,
}: Props) {
  return (
    <Flex
      css={{
        alignItems: 'center',
        gap: '$1',
        width,
      }}
    >
      <Avatar userId={userId} size={size} profile={profile} link />
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