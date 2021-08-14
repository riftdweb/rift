import { Flex, Text } from '@riftdweb/design-system'
import { Link } from './Link'
import { Avatar } from './Avatar'
import { useUser } from '../../hooks/useProfile'

type Props = {
  userId: string
  onClick?: () => void
  children?: React.ReactNode
  width?: string
  showName?: boolean
  size?: '1' | '2' | '3'
  avatarColor?: string
  textCss?: {}
}

export function User({
  userId,
  onClick,
  size = '2',
  width = '200px',
  showName = false,
  avatarColor,
  textCss,
  children,
}: Props) {
  const user = useUser(userId)
  const profile = user?.profile
  return (
    <Flex
      css={{
        alignItems: 'center',
        gap: '$1',
        width,
      }}
    >
      <Avatar
        userId={userId}
        size={size}
        profile={profile}
        link
        color={avatarColor}
      />
      <Link
        onClick={onClick}
        css={{
          ...textCss,
          overflow: 'hidden',
          padding: '5px 0',
          textDecoration: 'none',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          '&:hover': {
            textDecoration: 'none',
          },
        }}
        to={`/users/${userId}`}
      >
        <Flex css={{ gap: '$1' }}>
          {profile?.username ? (
            <Text>{profile?.username}</Text>
          ) : (
            <Text>{`${userId.slice(0, 5)}...`}</Text>
          )}
          {showName && profile?.firstName && (
            <Text css={{ color: '$gray800 !important' }}>
              {`${profile?.firstName} ${profile.lastName}`}
            </Text>
          )}
        </Flex>
      </Link>
      {children}
    </Flex>
  )
}
