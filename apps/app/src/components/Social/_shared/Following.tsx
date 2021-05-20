import { Avatar, Box, Button, Flex, Text } from '@riftdweb/design-system'
import debounce from 'lodash/debounce'
import { Fragment, useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'
import { socialDAC, userProfileDAC, useSkynet } from '../../../hooks/skynet'
import { useAvatarUrl } from '../../../hooks/useAvatarUrl'
import { Link } from '../../_shared/Link'

const debouncedMutate = debounce((mutate) => {
  return mutate()
}, 5000)

export const suggestionUserIds = [
  // Hacker News
  'd723ded05f38603593d455fe0f5c4fee5d52e67d7d66dfd63c56c51cef22a999',
  // Reddit Popular
  '3e6cbb387e26f405d8394ad8df3d4aa4e945fdf3850bcae1b5b0f602c797b292',
  // Reddit Tech
  'a36a0ceb9b8535822a5a7f37f13a184736c8a60f89722207228ce3373827a39c',
  // Reddit CryptoCurrency
  '2898f8a41a1c8ffa7777b44530db8e4b1d47f1a5e39d68784d22d86704143d2c',
  // Reddit Siacoin
  '8762804ded167d2dd7dea9c0c81af70fa45a145e301eb8af2e9bfb5bbcc2f79f',
]

function Profile({ profile, children }) {
  const avatarUrl = useAvatarUrl(profile)
  return (
    <Flex
      css={{
        alignItems: 'center',
        gap: '$1',
      }}
    >
      <Avatar size="2" src={avatarUrl} />
      <Text
        size="2"
        css={{
          color: '$hiContrast',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {profile.username}
      </Text>
      <Box css={{ flex: 1 }} />
      {children}
    </Flex>
  )
}

function SuggestedFollow({ profile, userId, handleFollow }) {
  return (
    <Profile profile={profile}>
      <Button onClick={() => handleFollow(profile.username, userId)}>
        Follow
      </Button>
    </Profile>
  )
}

function Follow({ profile, userId, handleUnfollow }) {
  return (
    <Profile profile={profile}>
      {/* <Link to={`/data/mysky/${userId}/profile-dac.hns/profileIndex.json`}>
        Data
      </Link> */}
      <Button onClick={() => handleUnfollow(userId)}>Unfollow</Button>
    </Profile>
  )
}

export function Following() {
  const { userId } = useSkynet()

  const [allSuggestions, setSuggestions] = useState<any[]>([])

  useEffect(() => {
    if (!suggestionUserIds || !suggestionUserIds.length) {
      return
    }
    const func = async () => {
      const profiles = []
      for (let userId of suggestionUserIds) {
        const profile = await userProfileDAC.getProfile(userId)
        profiles.push({
          userId,
          profile,
        })
      }

      setSuggestions(profiles)
    }
    func()
  }, [setSuggestions])

  const { data: followingUserIds, mutate } = useSWR(
    'followingList' + userId,
    () => socialDAC.getFollowingForUser(userId)
  )

  const [followings, setFollowings] = useState<any[]>([])

  useEffect(() => {
    if (!followingUserIds || !followingUserIds.length) {
      return
    }
    const func = async () => {
      const profiles = []
      for (let userId of followingUserIds) {
        const profile = await userProfileDAC.getProfile(userId)
        profiles.push({
          userId,
          profile,
        })
      }

      setFollowings(profiles)
    }
    func()
  }, [followingUserIds, setFollowings])

  console.log(followingUserIds)
  console.log(followings)

  const handleFollow = useCallback(
    (name, userId) => {
      const func = async () => {
        // mutate(followingUserIds.concat(userId), false)
        setFollowings(
          followings.concat({
            userId,
            profile: {
              username: name,
            },
          })
        )
        await socialDAC.follow(userId)
        debouncedMutate(mutate)
      }
      func()
    },
    [mutate, followingUserIds, followings, setFollowings]
  )

  const handleUnfollow = useCallback(
    (userId) => {
      const func = async () => {
        // mutate(
        //   followingUserIds.filter((fUserId) => fUserId !== userId),
        //   false
        // )
        setFollowings(
          followings.filter((following) => following.userId !== userId)
        )
        await socialDAC.unfollow(userId)
        debouncedMutate(mutate)
      }
      func()
    },
    [mutate, followingUserIds, followings, setFollowings]
  )

  const suggestions = allSuggestions.filter(
    (suggestion) =>
      !followings.find(({ userId }) => userId === suggestion.userId)
  )

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
