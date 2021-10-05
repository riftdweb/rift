import { Flex, Text } from '@riftdweb/design-system'
import { Link } from './Link'
import { Avatar } from './Avatar'
import { useUser } from '../hooks/useUser'

type Props = {
  userId: string
  onClick?: () => void
  children?: React.ReactNode
  width?: string
  showName?: boolean
  size?: '1' | '2' | '3'
  avatarColor?: string
  css?: {}
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
  css,
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
        ...css,
      }}
    >
      <Avatar
        userId={userId}
        size={size}
        profile={profile?.data}
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
        <Flex
          css={{
            gap: '$1',
          }}
        >
          {profile?.data?.username ? (
            <Text>{profile?.data?.username}</Text>
          ) : (
            <Text>{`${userId.slice(0, 5)}...`}</Text>
          )}
          {showName && profile?.data?.firstName && (
            <Text
              css={{
                color: '$gray800 !important',
                display: 'none',
                '@bp1': {
                  display: 'inline',
                },
              }}
            >
              {`${profile.data.firstName} ${profile.data.lastName}`}
            </Text>
          )}
        </Flex>
      </Link>
      {children}
    </Flex>
  )
}
