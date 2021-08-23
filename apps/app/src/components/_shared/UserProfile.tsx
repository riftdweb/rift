import { Box, Button, Flex, Text, Tooltip } from '@riftdweb/design-system'
import intersection from 'lodash/intersection'
import { User } from './User'
import { ChatBubbleIcon, GlobeIcon } from '@radix-ui/react-icons'
import { useUser } from '../../hooks/useUser'
import { UserContextMenu } from './UserContextMenu'
import {
  isFollower,
  isFollowing,
  isFriend,
  useUsers,
} from '../../contexts/users'
import { Fragment } from 'react'
import { IUser } from '@riftdweb/types'
import { People } from './People'
import { useSkynet } from '../../contexts/skynet'

type size = '1' | '2' | '3'

type Props = {
  userId?: string
  user?: IUser
  onClick?: () => void
  version?: 'regular' | 'compact'
}

const versionToSize: Record<Props['version'], size> = {
  compact: '2',
  regular: '3',
}

const versionToGap: Record<Props['version'], string> = {
  compact: '$1',
  regular: '$2',
}

export function UserProfile({
  userId: userIdParam,
  user: userParam,
  onClick,
  version = 'regular',
}: Props) {
  const { myUserId } = useSkynet()
  const userId = userIdParam || userParam.userId
  const user = useUser(userId)
  const profile = user?.profile
  const { handleFollow, allFollowing } = useUsers()
  const isMyself = userId === myUserId

  const verticalGap = versionToGap[version]
  const size = versionToSize[version]

  const infoElements = []

  if (profile?.data?.location) {
    infoElements.push(
      <Flex key="location" css={{ gap: '$1', alignItems: 'center' }}>
        <Text css={{ fontSize: '$2', color: '$gray900' }}>
          <GlobeIcon />
        </Text>
        <Text css={{ fontSize: '$2', color: '$gray900' }}>
          {profile.data?.location}
        </Text>
      </Flex>
    )
  }

  if (user?.feed.data && ~user.feed.data.count) {
    infoElements.push(
      <Flex key="posts" css={{ gap: '$1', alignItems: 'center' }}>
        <Text css={{ fontSize: '$2', color: '$gray900' }}>
          <ChatBubbleIcon />
        </Text>
        <Text css={{ fontSize: '$2', color: '$gray900' }}>
          {`${user.feed.data.count} posts`}
        </Text>
      </Flex>
    )
  }

  const knownFollowedByUserIds = intersection(
    allFollowing.data?.entries || [],
    user ? user.followers.data : []
  )
  // const knownFollowedByUserIds = userItem ? userItem.followerIds : []

  const contentOffset = version === 'compact' ? '30px' : '0'

  return (
    <Flex css={{ flexDirection: 'column', gap: verticalGap }}>
      <Flex css={{ gap: '$2', alignItems: 'center' }}>
        <User
          size={size}
          userId={userId}
          onClick={onClick}
          width="inherit"
          showName
          textCss={{
            color: '$hiContrast',
            fontWeight: '500',
          }}
        />
        <Box css={{ flex: 1 }} />
        <UserContextMenu userId={userId} />
        {myUserId &&
          !isMyself &&
          (isFriend(user) ? (
            <Flex css={{ gap: '$1', alignItems: 'center' }}>
              <Text css={{ fontSize: '$2', color: '$gray900' }}>Friends</Text>
            </Flex>
          ) : isFollowing(user) ? (
            <Flex css={{ gap: '$1', alignItems: 'center' }}>
              <Text css={{ fontSize: '$2', color: '$gray900' }}>Following</Text>
            </Flex>
          ) : isFollower(user) ? (
            <Button size="1" onClick={() => handleFollow(userId)}>
              <Text css={{ fontSize: '$2', color: '$gray900' }}>
                Follow back
              </Text>
            </Button>
          ) : (
            <Button size="1" onClick={() => handleFollow(userId)}>
              <Text css={{ fontSize: '$2', color: '$gray900' }}>Follow</Text>
            </Button>
          ))}
      </Flex>
      {profile?.data?.aboutMe && (
        <Flex
          css={{ gap: '$3', alignItems: 'center', paddingLeft: contentOffset }}
        >
          <Text size={size} css={{ lineHeight: '20px' }}>
            {profile?.data?.aboutMe}
          </Text>
        </Flex>
      )}
      {!!infoElements.length && (
        <Flex css={{ marginTop: '$1', paddingLeft: contentOffset }}>
          <Flex
            css={{
              gap: '$3',
              alignItems: 'center',
              width: '100%',
              height: '$3',
            }}
          >
            <Fragment>{infoElements}</Fragment>
          </Flex>
        </Flex>
      )}
      {user && (
        <Flex css={{ marginTop: '$2', paddingLeft: contentOffset }}>
          <Flex
            css={{
              gap: '$2',
              width: '100%',
              // height: '$3',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Tooltip content="Following" align="start">
              <Text
                css={{
                  fontSize: '$2',
                  color: '$gray800',
                  whiteSpace: 'nowrap',
                }}
              >
                {`${user.following.data?.length} following`}
              </Text>
            </Tooltip>
            {!!user.followers.data.length && (
              <Tooltip content="Discovered followers">
                <Text
                  css={{
                    fontSize: '$2',
                    color: '$gray800',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {`${user.followers.data.length} followers`}
                </Text>
              </Tooltip>
            )}
            <Box css={{ flex: 1 }} />
            {!!knownFollowedByUserIds.length && (
              <Flex css={{ alignItems: 'center', gap: '$1' }}>
                <Text
                  size="1"
                  css={{
                    color: '$gray800',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Followed by {knownFollowedByUserIds.length}{' '}
                  {knownFollowedByUserIds.length === 1 ? 'user' : 'users'} you
                  follow
                </Text>
                <People userIds={knownFollowedByUserIds.slice(0, 5)} />
              </Flex>
            )}
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}
