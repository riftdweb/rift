import { createContext, useCallback, useContext, useEffect } from 'react'
import useSWR, { SWRResponse } from 'swr'
import debounce from 'lodash/debounce'
import { socialDAC, useSkynet } from '../skynet'
import { fetchProfile } from '../useProfile'
import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { suggestionUserIds as _suggestionUserIds } from './suggestions'
import { Feed } from '../feed/types'
import { RequestQueue } from '../../shared/requestQueue'
import { workerFeedUserUpdate } from '../feed/workerFeedUser'
import { clearAllTokens } from '../feed/tokens'

const requestQueue = RequestQueue('users')

const debouncedMutate = debounce((mutate) => {
  return mutate()
}, 5000)

export type User = {
  userId: string
  profile: IUserProfile
}

type State = {
  followingUserIds: SWRResponse<string[], any>
  suggestionUserIds: SWRResponse<string[], any>
  followings: SWRResponse<Feed<User>, any>
  suggestions: SWRResponse<Feed<User>, any>
  handleFollow: (userId: string, profile: IUserProfile) => void
  handleUnfollow: (userId: string) => void
  checkIsFollowingUser: (userId: string) => boolean
  checkIsMyself: (userId: string) => boolean
}

const UsersContext = createContext({} as State)
export const useUsers = () => useContext(UsersContext)

type Props = {
  children: React.ReactNode
}

export function UsersProvider({ children }: Props) {
  const { userId: myUserId, getKey, controlRef: ref } = useSkynet()

  const followingUserIds = useSWR(
    getKey(['users', 'followingUserIds']),
    async () => {
      if (!myUserId) {
        return _suggestionUserIds.slice(0, 2)
      } else {
        const userIds = await socialDAC.getFollowingForUser(myUserId)
        return userIds || []
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  const suggestionUserIds = useSWR(
    followingUserIds.data ? getKey(['users', 'suggestionUserIds']) : null,
    async () => {
      if (!myUserId) {
        return []
      } else {
        return _suggestionUserIds.filter((suggestionUserId) => {
          if (suggestionUserId === myUserId) {
            return false
          }
          return !(followingUserIds.data || []).find(
            (userId) => userId === suggestionUserId
          )
        })
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  const followings = useSWR<Feed<User>>(
    followingUserIds.data ? getKey(['users', 'followings']) : null,
    async () => {
      const userIds = followingUserIds.data

      if (!userIds.length) {
        return {
          entries: [],
          updatedAt: new Date().getTime(),
        }
      }

      const profiles = []
      for (let userId of userIds) {
        const profile = await fetchProfile(ref, userId)
        profiles.push({
          userId,
          profile,
        })
      }

      return {
        entries: profiles,
        updatedAt: new Date().getTime(),
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  const suggestions = useSWR<Feed<User>>(
    suggestionUserIds.data ? getKey(['users', 'suggestions']) : null,
    async () => {
      const profiles = []
      for (let userId of suggestionUserIds.data) {
        const profile = await fetchProfile(ref, userId)
        profiles.push({
          userId,
          profile,
        })
      }
      return {
        entries: profiles,
        updatedAt: new Date().getTime(),
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  const handleFollow = useCallback(
    (userId: string, profile: IUserProfile) => {
      const func = async () => {
        followings.mutate(
          (feed) => ({
            entries: feed.entries.concat({
              userId,
              profile,
            }),
            updatedAt: new Date().getTime(),
          }),
          false
        )
        suggestions.mutate(
          (feed) => ({
            entries: feed.entries.filter((user) => user.userId !== userId),
            updatedAt: new Date().getTime(),
          }),
          false
        )
        try {
          const task = async () => await socialDAC.follow(userId)
          await requestQueue.add(task)

          if (requestQueue.queue.length === 0) {
            debouncedMutate(followingUserIds.mutate)
          }

          // Trigger update user
          clearAllTokens(ref)
          workerFeedUserUpdate(ref, userId, { force: true })
        } catch (e) {}
      }
      func()
    },
    [ref, followings, suggestions, followingUserIds]
  )

  const handleUnfollow = useCallback(
    (userId) => {
      const func = async () => {
        followings.mutate(
          (feed) => ({
            entries: feed.entries.filter(
              (following) => following.userId !== userId
            ),
            updatedAt: new Date().getTime(),
          }),
          false
        )
        try {
          const task = async () => await socialDAC.unfollow(userId)
          await requestQueue.add(task)

          if (requestQueue.queue.length === 0) {
            debouncedMutate(followingUserIds.mutate)
          }
        } catch (e) {}
      }
      func()
    },
    [followings, followingUserIds]
  )

  const checkIsFollowingUser = useCallback(
    (userId: string) => {
      // Use followings instead of followingUserIds in case there is an inflight optimistic update
      return !!followings.data?.entries.find((user) => user.userId === userId)
    },
    [followings]
  )
  const checkIsMyself = useCallback((userId: string) => myUserId === userId, [
    myUserId,
  ])

  // Update controlRef
  useEffect(() => {
    // If not null
    if (followingUserIds.data) {
      ref.current.followingUserIdsHasFetched = true
    }
    ref.current.followingUserIds = followingUserIds
  }, [ref, followingUserIds])

  const value = {
    checkIsFollowingUser,
    checkIsMyself,
    followingUserIds,
    suggestionUserIds,
    followings,
    suggestions,
    handleFollow,
    handleUnfollow,
  }

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}
