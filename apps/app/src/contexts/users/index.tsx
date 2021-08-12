import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import useSWR, { SWRResponse } from 'swr'
import debounce from 'lodash/debounce'
import { socialDAC, useSkynet } from '../skynet'
import { fetchUser } from '../../hooks/useProfile'
import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { Feed } from '../feed/types'
import { TaskQueue } from '../../shared/taskQueue'
import { workerFeedUserUpdate } from '../../workers/workerFeedUser'
import { IUser, UsersMap } from '@riftdweb/types'
import { cacheUsersMap, fetchUsersMap } from '../../workers/workerApi'
import { throttle } from 'lodash'
import { ControlRef } from '../skynet/ref'
import { createLogger } from '../../shared/logger'
import { suggestionList } from './suggestionList'
import { seedList } from './seedList'
import { denyList } from './denyList'

const log = createLogger('users')
const taskQueue = TaskQueue('users')

const debouncedMutate = debounce((mutate) => {
  return mutate()
}, 5000)

const throttledCacheUsersMap = throttle(
  (ref: ControlRef, userMap: UsersMap) => {
    log('caching usersMap')
    return cacheUsersMap(ref, userMap)
  },
  20_000
)

type State = {
  usersMap: SWRResponse<UsersMap, any>
  usersIndex: IUser[]
  pendingUserIds: string[]
  followingUserIds: SWRResponse<string[], any>
  suggestionUserIds: SWRResponse<string[], any>
  followings: SWRResponse<Feed<IUser>, any>
  suggestions: SWRResponse<Feed<IUser>, any>
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

// 5 minutes
// const CACHE_TIMEOUT = 1000 * 60 * 5
const CACHE_TIMEOUT = 1000 * 60 * 60

export function isUserUpToDate(user: IUser | undefined) {
  if (!user) {
    return false
  }
  const now = new Date().getTime()
  const timeSinceLastUpdate = now - user.updatedAt
  return timeSinceLastUpdate < CACHE_TIMEOUT
}

export function UsersProvider({ children }: Props) {
  const { myUserId, getKey, controlRef: ref } = useSkynet()

  const [hasSeededUserIds, setHasSeededUserIds] = useState<boolean>(false)

  const usersMap = useSWR(getKey(['users', 'map']), () => fetchUsersMap(ref), {
    revalidateOnFocus: false,
  })

  const pendingUserIds = useMemo(() => {
    if (!usersMap.data) {
      return []
    }
    return Object.entries(usersMap.data.entries)
      .filter(([userId, user]) => !isUserUpToDate(user))
      .map(([userId]) => userId)
  }, [usersMap])

  const getUser = useCallback(
    (userId: string): IUser => {
      if (!usersMap.data) {
        throw Error('getUser was called before usersMap initialization')
      }
      return usersMap.data.entries[userId]
    },
    [usersMap]
  )

  const upsertUser = useCallback(
    (user: IUser) => {
      const func = async () => {
        const nextUsersMap = await usersMap.mutate(
          (data) => ({
            ...data,
            entries: {
              ...data.entries,
              [user.userId]: {
                ...(data.entries[user.userId] || {}),
                ...user,
              },
            },
          }),
          false
        )

        await throttledCacheUsersMap(ref, nextUsersMap)
      }
      func()
    },
    [ref, usersMap]
  )

  const upsertUsers = useCallback(
    (users: IUser[]) => {
      const func = async () => {
        const nextUsersMap = await usersMap.mutate(
          (data) => ({
            ...data,
            entries: {
              ...data.entries,
              ...users.reduce(
                (acc, user) => ({
                  ...acc,
                  [user.userId]: {
                    ...(data.entries[user.userId] || {}),
                    ...user,
                  },
                }),
                {}
              ),
            },
          }),
          false
        )

        await throttledCacheUsersMap(ref, nextUsersMap)
      }
      func()
    },
    [ref, usersMap]
  )

  const addNewUserIds = useCallback(
    (userIds: string[]) => {
      if (!usersMap.data) {
        throw Error('Cannot add keys before usersMap has fetched')
      }
      const func = async () => {
        const newUserIds = userIds
          .filter((userId) => !denyList.includes(userId))
          .filter((userId) => !getUser(userId))
        log('Adding', newUserIds)
        const nextUsersMap = {
          entries: newUserIds.reduce(
            (acc, id) => ({
              ...acc,
              [id]: undefined,
            }),
            usersMap.data.entries
          ),
          updatedAt: new Date().getTime(),
        }

        usersMap.mutate(nextUsersMap, false)

        await throttledCacheUsersMap(ref, nextUsersMap)
      }
      func()
    },
    [ref, usersMap, getUser]
  )

  useEffect(() => {
    if (!hasSeededUserIds && usersMap.data) {
      addNewUserIds(seedList)
      setHasSeededUserIds(true)
    }
  }, [usersMap])

  const followingUserIds = useSWR(
    getKey(['users', 'followingUserIds']),
    async () => {
      if (!myUserId) {
        return suggestionList.slice(0, 2)
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
        return suggestionList.filter((suggestionUserId) => {
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

  const gatherUsers = useCallback(
    (userIds): Promise<IUser[]> => {
      const func = async (): Promise<IUser[]> => {
        const promises: Promise<IUser>[] = userIds.map((userId) =>
          fetchUser(ref, userId)
        )
        return Promise.all(promises)
      }
      return func()
    },
    [ref, usersMap, upsertUser]
  )

  const followings = useSWR<Feed<IUser>>(
    followingUserIds.data ? getKey(['users', 'followings']) : null,
    async () => {
      const userIds = followingUserIds.data

      if (!userIds.length) {
        return {
          entries: [],
          updatedAt: new Date().getTime(),
        }
      }

      const users = await gatherUsers(userIds)

      return {
        entries: users,
        updatedAt: new Date().getTime(),
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  const suggestions = useSWR<Feed<IUser>>(
    suggestionUserIds.data ? getKey(['users', 'suggestions']) : null,
    async () => {
      const userIds = suggestionUserIds.data

      const users = await gatherUsers(userIds)

      return {
        entries: users,
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
              updatedAt: new Date().getTime(),
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
          await taskQueue.append(task)

          if (taskQueue.queue.length === 0) {
            debouncedMutate(followingUserIds.mutate)
          }

          // Trigger update user
          workerFeedUserUpdate(ref, userId, { force: true, prioritize: true })
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
          await taskQueue.append(task)

          if (taskQueue.queue.length === 0) {
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
  const checkIsFollowerUser = useCallback(
    (userId: string) => {
      return usersMap.data?.entries[userId].followingIds?.includes(myUserId)
    },
    [myUserId, usersMap]
  )
  const checkIsMyself = useCallback((userId: string) => myUserId === userId, [
    myUserId,
  ])

  const usersIndex = useMemo(() => {
    if (!usersMap.data) {
      return []
    }
    return Object.entries(usersMap.data.entries)
      .map(([id, entry]) => entry)
      .filter((entry) => !!entry)
      .sort((a, b) => {
        const isFollowingUserA = checkIsFollowingUser(a.userId)
        const isFollowerUserA = checkIsFollowerUser(a.userId)
        const isFollowingUserB = checkIsFollowingUser(b.userId)
        // const isFollowerUserB = checkIsFollowerUser(b.userId)
        return isFollowingUserA
          ? -1
          : isFollowingUserB
          ? 1
          : isFollowerUserA
          ? -1
          : 1
      })
  }, [usersMap, checkIsFollowingUser])

  useEffect(() => {
    ref.current.usersMap = usersMap
    ref.current.usersIndex = usersIndex
    ref.current.getUser = getUser
    ref.current.upsertUser = upsertUser
    ref.current.upsertUsers = upsertUsers
    ref.current.pendingUserIds = pendingUserIds
    ref.current.addNewUserIds = addNewUserIds
    // If not null
    if (followingUserIds.data) {
      ref.current.followingUserIdsHasFetched = true
    }
    ref.current.followingUserIds = followingUserIds
  }, [
    ref,
    followingUserIds,
    followings,
    suggestions,
    usersMap,
    usersIndex,
    getUser,
    upsertUser,
    upsertUsers,
    pendingUserIds,
    addNewUserIds,
  ])

  const value = {
    usersMap,
    usersIndex,
    pendingUserIds,
    addNewUserIds,
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
