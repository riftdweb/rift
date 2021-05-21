import { Button, Flex, Text } from '@riftdweb/design-system'
import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { Fragment } from 'react'
import { useSkynet } from '../../../hooks/skynet'
import { useUsers } from '../../../hooks/users'
import { UserContextMenu } from '../../_shared/UserContextMenu'
import { User } from './User'

type SuggestedFollowProps = {
  userId: string
  profile: IUserProfile
  handleFollow: (username: string, userId: string) => void
}

function SuggestedFollow({
  profile,
  userId,
  handleFollow,
}: SuggestedFollowProps) {
  return (
    <User userId={userId} profile={profile}>
      <Button onClick={() => handleFollow(profile.username, userId)}>
        Follow
      </Button>
    </User>
  )
}

type FollowProps = {
  userId: string
  profile: IUserProfile
  handleUnfollow?: (userId: string) => void
  showContextMenu?: boolean
}

function Follow({
  profile,
  userId,
  handleUnfollow,
  showContextMenu = true,
}: FollowProps) {
  return (
    <User userId={userId} profile={profile}>
      {/* <Link to={`/data/mysky/${userId}/profile-dac.hns/profileIndex.json`}>
        Data
      </Link> */}
      {!showContextMenu && (
        <UserContextMenu
          userId={userId}
          profile={profile}
          handleUnfollow={handleUnfollow}
        />
      )}
    </User>
  )
}

export function Following() {
  const { userId, myProfile } = useSkynet()
  const { followings, suggestions, handleFollow, handleUnfollow } = useUsers()

  return (
    <Flex
      css={{
        position: 'sticky',
        top: 0,
        flexDirection: 'column',
        gap: '$3',
        width: '200px',
        pt: '$3',
      }}
    >
      <Flex
        css={{
          flexDirection: 'column',
          width: '100%',
          gap: '$2',
        }}
      >
        <Follow
          key={userId}
          profile={myProfile}
          userId={userId}
          showContextMenu={false}
        />
      </Flex>
      <Text
        css={{
          color: '$gray900',
          fontWeight: '600',
        }}
      >
        Following
      </Text>
      <Flex
        css={{
          flexDirection: 'column',
          width: '100%',
          gap: '$2',
        }}
      >
        {followings.map(({ userId, profile }) => (
          <Follow
            key={userId}
            profile={profile}
            userId={userId}
            handleUnfollow={handleUnfollow}
          />
        ))}
      </Flex>
      {!!suggestions.length && (
        <Fragment>
          <Text
            css={{
              color: '$gray900',
              fontWeight: '600',
            }}
          >
            Suggestions
          </Text>
          <Flex
            css={{
              flexDirection: 'column',
              width: '100%',
              gap: '$2',
            }}
          >
            {suggestions.map(({ userId, profile }) => (
              <SuggestedFollow
                key={userId}
                userId={userId}
                profile={profile}
                handleFollow={handleFollow}
              />
            ))}
          </Flex>
        </Fragment>
      )}
    </Flex>
  )
}
