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
import uniq from 'lodash/uniq'
import { socialDAC, useSkynet } from '../skynet'
import { fetchUser } from '../../hooks/useProfile'
import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { Feed } from '@riftdweb/types'
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
import { apiLimiter } from '../skynet/api'
import { recomputeFollowers } from '../../workers/workerUsersIndexer'

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

export function isFollowing(user?: IUser) {
  return !!user && ['friend', 'following'].includes(user.relationship)
}

export function isFollower(user?: IUser) {
  return !!user && ['friend', 'follower'].includes(user.relationship)
}

export function isFriend(user?: IUser) {
  return !!user && user.relationship === 'friend'
}

type State = {
  usersMap: SWRResponse<UsersMap, any>
  usersIndex: IUser[]
  pendingUserIds: string[]
  followingUserIds: SWRResponse<string[], any>
  friends: SWRResponse<Feed<IUser>, any>
  followings: SWRResponse<Feed<IUser>, any>
  suggestions: SWRResponse<Feed<IUser>, any>
  handleFollow: (userId: string, profile: IUserProfile) => void
  handleUnfollow: (userId: string) => void
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersMap])

  const followingUserIds = useSWR(
    getKey(['users', 'followingUserIds']),
    async () => {
      if (!myUserId) {
        return suggestionList.slice(0, 2)
      } else {
        const task = async () => {
          try {
            const userIds = await socialDAC.getFollowingForUser(myUserId)
            return userIds || []
          } catch (e) {
            throw Error('Could not fetch followers')
          }
        }
        return apiLimiter.add(task, { priority: 2 })
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
          fetchUser(ref, userId, {
            priority: 1,
          })
        )
        return Promise.all(promises)
      }
      return func()
    },
    [ref]
  )

  const allFollowings = useSWR<Feed<IUser>>(
    followingUserIds.data
      ? getKey(['users', 'allFollowings', followingUserIds.data])
      : null,
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

  const followings = useSWR<Feed<IUser>>(
    allFollowings.data ? getKey(['users', 'followers']) : null,
    async () => {
      const users = allFollowings.data

      if (!users.entries) {
        return {
          entries: [],
          updatedAt: new Date().getTime(),
        }
      }

      return {
        entries: users.entries.filter((user) => !isFriend(user)),
        updatedAt: new Date().getTime(),
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  const friends = useSWR<Feed<IUser>>(
    allFollowings.data
      ? getKey(['users', 'friends', allFollowings.data])
      : null,
    async () => {
      const users = allFollowings.data

      if (!users.entries) {
        return {
          entries: [],
          updatedAt: new Date().getTime(),
        }
      }

      return {
        entries: users.entries.filter((user) => isFriend(user)),
        updatedAt: new Date().getTime(),
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  const suggestions = useSWR<Feed<IUser>>(
    followingUserIds.data
      ? getKey(['users', 'suggestions', followingUserIds.data])
      : null,
    async () => {
      if (!myUserId) {
        return {
          entries: [],
          updatedAt: new Date().getTime(),
        }
      } else {
        const randomUserIds = [
          seedList[Math.floor(Math.random() * seedList.length)],
          seedList[Math.floor(Math.random() * seedList.length)],
          seedList[Math.floor(Math.random() * seedList.length)],
          seedList[Math.floor(Math.random() * seedList.length)],
          seedList[Math.floor(Math.random() * seedList.length)],
        ]
        const userIds = uniq([...randomUserIds, ...suggestionList]).filter(
          (suggestionUserId) => {
            if (suggestionUserId === myUserId) {
              return false
            }
            return !(followingUserIds.data || []).find(
              (userId) => userId === suggestionUserId
            )
          }
        )

        const users = await gatherUsers(userIds)

        return {
          entries: users,
          updatedAt: new Date().getTime(),
        }
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  const handleFollow = useCallback(
    (userId: string, profile: IUserProfile) => {
      const func = async () => {
        const user = getUser(userId)

        // Update data sources
        if (user) {
          upsertUser({
            ...user,
            followerIds: uniq([...user.followerIds, myUserId]),
            updatedAt: new Date().getTime(),
          })
        }
        followingUserIds.mutate((ids) => uniq([...ids, userId]), false)
        recomputeFollowers(ref)

        try {
          const follow = async () => {
            try {
              await socialDAC.follow(userId)
            } catch (e) {}
          }

          await taskQueue.add(async () => {
            await apiLimiter.add(follow, {
              priority: 2,
            })
          })

          if (taskQueue.queue.length === 0) {
            debouncedMutate(followingUserIds.mutate)
          }

          // Trigger update user
          workerFeedUserUpdate(ref, userId, { force: true, priority: 2 })
        } catch (e) {}
      }
      func()
    },
    [ref, myUserId, followingUserIds, getUser, upsertUser]
  )

  const handleUnfollow = useCallback(
    (userId) => {
      const func = async () => {
        const user = getUser(userId)

        // Update data sources
        if (user) {
          upsertUser({
            ...user,
            userId,
            followerIds: user.followerIds.filter((id) => id !== myUserId),
            updatedAt: new Date().getTime(),
          })
        }
        followingUserIds.mutate(
          (ids) => ids.filter((id) => id !== userId),
          false
        )
        recomputeFollowers(ref)
        try {
          const unfollow = async () => {
            try {
              await socialDAC.unfollow(userId)
            } catch (e) {}
          }

          await taskQueue.add(async () => {
            await apiLimiter.add(unfollow, {
              priority: 2,
            })
          })

          if (taskQueue.queue.length === 0) {
            debouncedMutate(followingUserIds.mutate)
          }
        } catch (e) {}
      }
      func()
    },
    [ref, myUserId, getUser, upsertUser, followingUserIds]
  )

  const usersIndex = useMemo(() => {
    if (!usersMap.data) {
      return []
    }
    return Object.entries(usersMap.data.entries)
      .map(([id, entry]) => entry)
      .filter((entry) => !!entry)
      .sort((a, b) => {
        const isFollowingUserA = isFollowing(a)
        const isFollowerUserA = isFollower(a)
        const isFollowingUserB = isFollowing(b)
        // const isFollowerUserB = isFollower(b)
        return isFollowingUserA
          ? -1
          : isFollowingUserB
          ? 1
          : isFollowerUserA
          ? -1
          : 1
      })
  }, [usersMap])

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
    allFollowings,
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
    followingUserIds,
    followings,
    friends,
    suggestions,
    handleFollow,
    handleUnfollow,
  }

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}
