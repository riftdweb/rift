import React, { Fragment } from 'react'
import { useObservableState } from 'observable-hooks'
import { Box, Button, Flex, Text, Tooltip } from '@riftdweb/design-system'
import intersection from 'lodash/intersection'
import { User } from './User'
import { ChatBubbleIcon, GlobeIcon } from '@radix-ui/react-icons'
import { useUser } from '../hooks/useUser'
import { UserContextMenu } from './UserContextMenu'
import { isFollower, isFollowing, isFriend } from '../services/users/utils'
import { handleFollow } from '../services/users'
import { IUser } from '@riftdweb/types'
import { People } from './People'
import { useAccount } from '../hooks/useAccount'
import { getFollowers, getFollowing } from '../services/users/api'

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
  const { myUserId } = useAccount()
  const userId = userIdParam || userParam.userId
  const user = useUser(userId)
  const profile = user?.profile
  const isMyself = userId === myUserId

  const verticalGap = versionToGap[version]
  const size = versionToSize[version]

  const infoElements = []

  if (profile?.data?.location) {
    infoElements.push(
      <Flex key="location" css={{ gap: '$1', alignItems: 'center' }}>
        <Text css={{ fontSize: '$2', color: '$gray11' }}>
          <GlobeIcon />
        </Text>
        <Text css={{ fontSize: '$2', color: '$gray11' }}>
          {profile.data?.location}
        </Text>
      </Flex>
    )
  }

  if (user?.feed.data && ~user.feed.data.count) {
    infoElements.push(
      <Flex key="posts" css={{ gap: '$1', alignItems: 'center' }}>
        <Text css={{ fontSize: '$2', color: '$gray11' }}>
          <ChatBubbleIcon />
        </Text>
        <Text css={{ fontSize: '$2', color: '$gray11' }}>
          {`${user.feed.data.count} posts`}
        </Text>
      </Flex>
    )
  }

  const following = useObservableState(getFollowing().$)
  const followers = useObservableState(getFollowers().$)

  const knownFollowedByUsers = intersection(following, followers)
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
              <Text css={{ fontSize: '$2', color: '$gray11' }}>Friends</Text>
            </Flex>
          ) : isFollowing(user) ? (
            <Flex css={{ gap: '$1', alignItems: 'center' }}>
              <Text css={{ fontSize: '$2', color: '$gray11' }}>Following</Text>
            </Flex>
          ) : isFollower(user) ? (
            <Button size="1" onClick={() => handleFollow(userId)}>
              <Text css={{ fontSize: '$2', color: '$gray11' }}>
                Follow back
              </Text>
            </Button>
          ) : (
            <Button size="1" onClick={() => handleFollow(userId)}>
              <Text css={{ fontSize: '$2', color: '$gray11' }}>Follow</Text>
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
                  color: '$gray10',
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
                    color: '$gray10',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {`${user.followers.data.length} followers`}
                </Text>
              </Tooltip>
            )}
            <Box css={{ flex: 1 }} />
            {!!knownFollowedByUsers.length && (
              <Flex css={{ alignItems: 'center', gap: '$1' }}>
                <Text
                  size="1"
                  css={{
                    color: '$gray10',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Followed by {knownFollowedByUsers.length}{' '}
                  {knownFollowedByUsers.length === 1 ? 'user' : 'users'} you
                  follow
                </Text>
                <People
                  userIds={knownFollowedByUsers
                    .slice(0, 5)
                    .map((user) => user.userId)}
                />
              </Flex>
            )}
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}
