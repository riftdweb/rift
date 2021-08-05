import { useParams } from 'react-router-dom'
import {
  Badge,
  Box,
  Button,
  Flex,
  Text,
  Tooltip,
} from '@riftdweb/design-system'
import intersection from 'lodash/intersection'
import { User } from './User'
import { ChatBubbleIcon, EyeOpenIcon, GlobeIcon } from '@radix-ui/react-icons'
import { useProfile } from '../../hooks/useProfile'
import { useFeed } from '../../contexts/feed'
import { UserContextMenu } from './UserContextMenu'
import { useUsers } from '../../contexts/users'
import { Fragment, useMemo } from 'react'
import { UserItem } from '@riftdweb/types'
import { People } from './People'
import { useSkynet } from '../../contexts/skynet'

type size = '1' | '2' | '3'

type Props = {
  userId: string
  userItem?: UserItem
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

export function UserProfile({ userId, userItem, version = 'regular' }: Props) {
  const { myUserId } = useSkynet()
  const { userId: viewingUserId } = useParams()
  const profile = useProfile(userId)
  const { user } = useFeed()
  const {
    handleFollow,
    checkIsFollowingUser,
    checkIsMyself,
    followingUserIds,
  } = useUsers()
  const isViewingUser = userId === viewingUserId
  const entriesCount = isViewingUser
    ? user.response.data?.entries.length || 0
    : null

  const isFollowingUser = useMemo(() => checkIsFollowingUser(userId), [
    checkIsFollowingUser,
    userId,
  ])
  const isFollowerUser = useMemo(
    () => userItem?.followingIds.includes(myUserId),
    [userItem, myUserId]
  )

  const isMyself = useMemo(() => checkIsMyself(userId), [checkIsMyself, userId])

  const verticalGap = versionToGap[version]
  const size = versionToSize[version]

  const infoElements = []

  if (profile?.location) {
    infoElements.push(
      <Flex css={{ gap: '$1', alignItems: 'center' }}>
        <Text css={{ fontSize: '$2', color: '$gray900' }}>
          <GlobeIcon />
        </Text>
        <Text css={{ fontSize: '$2', color: '$gray900' }}>
          {profile.location}
        </Text>
      </Flex>
    )
  }

  if (isViewingUser && entriesCount) {
    infoElements.push(
      <Flex css={{ gap: '$1', alignItems: 'center' }}>
        <Text css={{ fontSize: '$2', color: '$gray900' }}>
          <ChatBubbleIcon />
        </Text>
        <Text css={{ fontSize: '$2', color: '$gray900' }}>
          {`${entriesCount} posts`}
        </Text>
      </Flex>
    )
  }

  // if (userItem) {
  //   infoElements.push(
  //     <Text css={{ fontSize: '$2', color: '$gray900' }}>
  //       {`${userItem.followingIds.length} following`}
  //     </Text>
  //   )
  //   infoElements.push(
  //     <Text css={{ fontSize: '$2', color: '$gray900' }}>
  //       {`${userItem.followerIds.length} followers`}
  //     </Text>
  //   )
  // }
  const networkElements = []

  const knownFollowedByUserIds = intersection(
    followingUserIds.data || [],
    userItem ? userItem.followerIds : []
  )
  // const knownFollowedByUserIds = userItem ? userItem.followerIds : []

  return (
    <Flex css={{ flexDirection: 'column', gap: verticalGap }}>
      <Flex css={{ gap: '$2', alignItems: 'center' }}>
        <User size={size} userId={userId} profile={profile} width="inherit" />
        {isFollowerUser && <Badge>Follows you</Badge>}
        <Box css={{ flex: 1 }} />
        <UserContextMenu userId={userId} profile={profile} />
        {!isMyself &&
          (isFollowingUser ? (
            <Flex css={{ gap: '$1', alignItems: 'center' }}>
              <Text css={{ fontSize: '$2', color: '$gray900' }}>
                <EyeOpenIcon />
              </Text>
              <Text css={{ fontSize: '$2', color: '$gray900' }}>Following</Text>
            </Flex>
          ) : (
            <Button size="1" onClick={() => handleFollow(userId, profile)}>
              Follow
            </Button>
          ))}
      </Flex>
      {profile?.aboutMe && (
        <Flex css={{ gap: '$3', alignItems: 'center' }}>
          <Text size={size} css={{ lineHeight: '20px' }}>
            {profile.aboutMe}
          </Text>
        </Flex>
      )}
      {!!infoElements.length && (
        <Flex css={{ marginTop: '$1' }}>
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
      {userItem && (
        <Flex css={{ marginTop: '$1' }}>
          <Flex
            css={{
              gap: '$3',
              alignItems: 'center',
              width: '100%',
              height: '$3',
            }}
          >
            <Tooltip content="Following" align="start">
              <Text css={{ fontSize: '$2', color: '$gray900' }}>
                {`${userItem.followingIds.length} following`}
              </Text>
            </Tooltip>
            <Tooltip content="Discovered followers">
              <Text css={{ fontSize: '$2', color: '$gray900' }}>
                {`${userItem.followerIds.length} followers`}
              </Text>
            </Tooltip>
            <Box css={{ flex: 1 }} />
            {!!knownFollowedByUserIds.length && (
              <Flex css={{ alignItems: 'center', gap: '$1' }}>
                <Text size="1" css={{ color: '$gray900' }}>
                  Followed by {knownFollowedByUserIds.length}{' '}
                  {knownFollowedByUserIds.length === 1 ? 'user' : 'users'} you
                  follow
                </Text>
                <People userIds={knownFollowedByUserIds} />
              </Flex>
            )}
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}
