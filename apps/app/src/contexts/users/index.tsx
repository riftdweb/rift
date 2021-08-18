import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import useSWR, { mutate, SWRResponse } from 'swr'
import debounce from 'lodash/debounce'
import uniq from 'lodash/uniq'
import throttle from 'lodash/throttle'
import { socialDAC, useSkynet } from '../skynet'
import {
  fetchUserForInteraction,
  fetchUserForInteractionSync,
  fetchUserForRendering,
} from '../../workers/workerUpdateUser'
import { Feed } from '@riftdweb/types'
import { TaskQueue } from '../../shared/taskQueue'
import { workerFeedUserUpdate } from '../../workers/workerFeedUser'
import { IUser, UsersMap } from '@riftdweb/types'
import { cacheUsersMap, fetchUsersMap } from '../../workers/workerApi'
import { ControlRef } from '../skynet/ref'
import { createLogger } from '../../shared/logger'
import { suggestionList } from './suggestionList'
import { seedList } from './seedList'
import { denyList } from './denyList'
import { apiLimiter } from '../skynet/api'
import { recomputeFollowers } from '../../workers/workerUsersIndexer'
import { getDataKeyUsers } from '../../shared/dataKeys'
import { v4 as uuid } from 'uuid'
import { formatDistance } from 'date-fns'

const log = createLogger('users')
const taskQueue = TaskQueue('users')
const dataKeyUsers = getDataKeyUsers()

const debouncedMutate = debounce((mutate) => {
  return mutate()
}, 5000)

const throttledCacheUsersMap = throttle(
  async (ref: ControlRef, userMap: UsersMap) => {
    log('caching usersMap')
    await cacheUsersMap(ref, userMap)
    log('caching userMap done')
  },
  20_000
)

export function isFollowing(user?: IUser) {
  return !!user && ['friend', 'following'].includes(user.relationship.data)
}

export function isFollower(user?: IUser) {
  return !!user && ['friend', 'follower'].includes(user.relationship.data)
}

export function isFriend(user?: IUser) {
  return !!user && user.relationship.data === 'friend'
}

type State = {
  usersMap: SWRResponse<UsersMap, any>
  usersIndex: IUser[]
  pendingUserIds: string[]
  userCounts: {
    discovered: number
    hasBeenIndexed: number
    neverBeenIndexed: number
    pendingIndexing: number
    pendingReindexing: number
  }
  followingUserIds: SWRResponse<string[], any>
  friends: SWRResponse<Feed<IUser>, any>
  followings: SWRResponse<Feed<IUser>, any>
  suggestions: SWRResponse<Feed<IUser>, any>
  handleFollow: (userId: string) => void
  handleUnfollow: (userId: string) => void
}

const UsersContext = createContext({} as State)
export const useUsers = () => useContext(UsersContext)

type Props = {
  children: React.ReactNode
}

type UserResourceKeys = 'profile' | 'following' | 'feed'

const resourceTimeoutMap: Record<UserResourceKeys, number> = {
  profile: 1000 * 60 * 60,
  following: 1000 * 60 * 30,
  feed: 1000 * 60 * 20,
}

type IsUpToDateParams = {
  verbose?: boolean
  log?: (message: string) => void
}

export function isUpToDate(
  user: IUser | undefined,
  resource: UserResourceKeys,
  params: IsUpToDateParams = {}
) {
  if (!user) {
    return false
  }
  const updatedAt = user[resource].updatedAt
  const timeout = resourceTimeoutMap[resource]

  const { verbose = false, log = console.log } = params

  const now = new Date().getTime()
  const timeSinceLastUpdate = now - updatedAt
  const isResourceUpToDate = timeSinceLastUpdate < timeout
  if (verbose) {
    const ago = formatDistance(new Date(updatedAt), new Date(), {
      addSuffix: true,
    })
    log(
      `${resource ? `${resource} ` : ''}${
        isResourceUpToDate ? 'current' : 'expired'
      } - updated ${ago}`
    )
  }
  return isResourceUpToDate
}

type IsUserUpToDateParams = {
  include?: UserResourceKeys[]
  verbose?: boolean
  log?: (message: string) => void
}

export function isUserUpToDate(
  user: IUser | undefined,
  params: IsUserUpToDateParams = {}
) {
  const {
    include = ['profile', 'feed'],
    verbose = false,
    log = console.log,
  } = params

  if (!user) {
    return false
  }
  if (
    include.includes('profile') &&
    !isUpToDate(user, 'profile', {
      verbose,
      log,
    })
  ) {
    return false
  }
  if (
    include.includes('following') &&
    !isUpToDate(user, 'following', {
      verbose,
      log,
    })
  ) {
    return false
  }
  if (
    include.includes('feed') &&
    !isUpToDate(user, 'feed', {
      verbose,
      log,
    })
  ) {
    return false
  }
  return true
}

export function UsersProvider({ children }: Props) {
  const { myUserId, getKey, controlRef: ref, appDomain } = useSkynet()

  const [hasSeededUserIds, setHasSeededUserIds] = useState<boolean>(false)

  const usersMap = useSWR(
    getKey([appDomain, dataKeyUsers]),
    () => fetchUsersMap(ref),
    {
      revalidateOnFocus: false,
    }
  )

  const usersIndex = useMemo(() => {
    if (!usersMap.data) {
      return []
    }
    return (
      Object.entries(usersMap.data.entries)
        .map(([id, entry]) => entry)
        // TODO: can just initialize as buildUser
        .filter((entry) => !!entry)
        .sort(sortByRelationship)
    )
  }, [usersMap])

  const pendingUserIds = useMemo(() => {
    if (!usersMap.data) {
      return []
    }
    return (
      Object.entries(usersMap.data.entries)
        // Filter out any thing that is fully up to date
        .filter(
          ([userId, user]) =>
            !isUserUpToDate(user, {
              include: ['profile', 'following', 'feed'],
            })
        )
        // Filter out any thing that is fully up to date
        .sort(([_aId, a], [_bId, b]) => sortByRelationship(a, b))
        .map(([userId]) => userId)
    )
  }, [usersMap])

  const discoveredUsersCount = useMemo(() => {
    return Object.entries(usersMap.data?.entries || {}).length
  }, [usersMap])

  const indexedUsersCount = useMemo(() => {
    return usersIndex.length
  }, [usersIndex])

  const pendingIndexingUsersCount = useMemo(() => {
    return pendingUserIds.length
  }, [pendingUserIds])

  const userCounts = useMemo(() => {
    const neverBeenIndexed = discoveredUsersCount - indexedUsersCount
    return {
      discovered: discoveredUsersCount,
      hasBeenIndexed: indexedUsersCount,
      neverBeenIndexed: discoveredUsersCount - indexedUsersCount,
      pendingReindexing: pendingIndexingUsersCount - neverBeenIndexed,
      pendingIndexing: pendingIndexingUsersCount,
    }
  }, [discoveredUsersCount, indexedUsersCount, pendingIndexingUsersCount])

  const gatherUsers = useCallback(
    (userIds): Promise<IUser[]> => {
      const func = async (): Promise<IUser[]> => {
        try {
          const workflowId = uuid()
          const promises: Promise<IUser>[] = userIds.map((userId) =>
            fetchUserForRendering(ref, userId, workflowId)
          )
          return Promise.all(promises)
        } catch (e) {
          return []
        }
      }
      return func()
    },
    [ref]
  )

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
        const nextUsersMap = await usersMap.mutate((data) => {
          const nextUser = {
            ...(data.entries[user.userId] || {}),
            ...user,
          }

          return {
            ...data,
            entries: {
              ...data.entries,
              [user.userId]: nextUser,
            },
          }
        }, false)

        // Refresh useUser hooks, timeout to avoid cancelling a running mutation
        setTimeout(() => {
          mutate(getDataKeyUsers(user.userId))
        }, 1000)

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
        // log('Adding', newUserIds)
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

  // Initialize usersMap
  useEffect(() => {
    if (!hasSeededUserIds && usersMap.data) {
      addNewUserIds(seedList)
      setHasSeededUserIds(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersMap])

  const followingIds = useSWR(
    getKey([getDataKeyUsers('followingIds')]),
    async () => {
      if (!myUserId) {
        return suggestionList.slice(0, 2)
      } else {
        const task = async () => {
          try {
            const user = await fetchUserForInteractionSync(ref, myUserId)
            return user.following.data
          } catch (e) {
            console.log(e)
            throw Error('Could not get followers')
          }
        }
        return apiLimiter.add(task, {
          name: `get following ids: ${myUserId.slice(0, 5)}`,
          priority: 2,
        })
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  const allFollowing = useSWR<Feed<IUser>>(
    followingIds.data
      ? getKey([getDataKeyUsers('allFollowing'), followingIds.data])
      : null,
    async () => {
      const userIds = followingIds.data

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
    followingIds.data
      ? getKey([getDataKeyUsers('suggestions'), followingIds.data])
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
            return !(followingIds.data || []).find(
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

  const following = useSWR<Feed<IUser>>(
    allFollowing.data
      ? getKey([getDataKeyUsers('following'), allFollowing.data])
      : null,
    async () => {
      const users = allFollowing.data

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
    allFollowing.data
      ? getKey([getDataKeyUsers('friends'), allFollowing.data])
      : null,
    async () => {
      const users = allFollowing.data

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

  const handleFollow = useCallback(
    (userId: string) => {
      const func = async () => {
        const user = getUser(userId)

        // Update data sources
        if (user) {
          upsertUser({
            ...user,
            followers: {
              ...user.followers,
              data: uniq([...user.followers.data, myUserId]),
            },
          })
        }
        followingIds.mutate((ids) => uniq([...ids, userId]), false)
        recomputeFollowers(ref)

        try {
          const follow = async () => {
            try {
              await socialDAC.follow(userId)
            } catch (e) {}
          }

          await taskQueue.add(
            async () => {
              await apiLimiter.add(follow, {
                name: `follow: ${userId.slice(0, 5)}`,
                priority: 2,
              })
            },
            {
              name: `users: follow ${userId}`,
            }
          )

          if (taskQueue.queue.length === 0) {
            debouncedMutate(followingIds.mutate)
          }

          // Trigger update user
          workerFeedUserUpdate(ref, userId, { force: true, priority: 2 })
        } catch (e) {}
      }
      func()
    },
    [ref, myUserId, followingIds, getUser, upsertUser]
  )

  const handleUnfollow = useCallback(
    (userId: string) => {
      const func = async () => {
        const user = getUser(userId)

        // Update data sources
        if (user) {
          upsertUser({
            ...user,
            userId,
            followers: {
              ...user.followers,
              data: user.followers.data.filter((id) => id !== myUserId),
            },
          })
        }
        followingIds.mutate((ids) => ids.filter((id) => id !== userId), false)
        recomputeFollowers(ref)
        try {
          const unfollow = async () => {
            try {
              await socialDAC.unfollow(userId)
            } catch (e) {}
          }

          await taskQueue.add(
            async () => {
              await apiLimiter.add(unfollow, {
                name: `unfollow: ${userId.slice(0, 5)}`,
                priority: 2,
              })
            },
            {
              name: `users: unfollow ${userId}`,
            }
          )

          if (taskQueue.queue.length === 0) {
            debouncedMutate(followingIds.mutate)
          }
        } catch (e) {}
      }
      func()
    },
    [ref, myUserId, getUser, upsertUser, followingIds]
  )

  useEffect(() => {
    ref.current.usersMap = usersMap
    ref.current.usersIndex = usersIndex
    ref.current.getUser = getUser
    ref.current.upsertUser = upsertUser
    ref.current.upsertUsers = upsertUsers
    ref.current.pendingUserIds = pendingUserIds
    ref.current.addNewUserIds = addNewUserIds
    // If not null
    if (followingIds.data) {
      ref.current.followingUserIdsHasFetched = true
    }
    ref.current.followingUserIds = followingIds
  }, [
    ref,
    followingIds,
    allFollowing,
    suggestions,
    usersMap,
    usersIndex,
    getUser,
    upsertUser,
    upsertUsers,
    pendingUserIds,
    addNewUserIds,
  ])

  // Dev helpers
  useEffect(() => {
    // @ts-ignore
    window.clearUsersMap = cacheUsersMap(
      ref,
      {
        entries: {},
        updatedAt: 0,
      },
      { priority: 4 }
    )
    // @ts-ignore
    window.getUser = getUser

    // @ts-ignore
    window.getUserStatus = (userId: string) => {
      const user = ref.current.getUser(userId)
      isUserUpToDate(user, {
        verbose: true,
        include: ['profile', 'following', 'feed'],
      })
    }

    // @ts-ignore
    window.riftUserCount = () => {
      const count = ref.current.usersIndex.reduce(
        (acc, user) => (user.meta?.data.skapps['riftapp.hns'] ? acc + 1 : acc),
        0
      )
      console.log(
        `${count}/${ref.current.usersIndex.length}/${
          Object.keys(ref.current.usersMap.data?.entries || {}).length
        }`
      )
    }
  }, [ref])

  const value = {
    usersMap,
    usersIndex,
    userCounts,
    pendingUserIds,
    addNewUserIds,
    followingUserIds: followingIds,
    followings: following,
    friends,
    suggestions,
    handleFollow,
    handleUnfollow,
  }

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}

function sortByRelationship(a?: IUser, b?: IUser): 1 | -1 {
  if (!a) {
    return 1
  }
  if (!b) {
    return -1
  }
  const isFollowingUserA = isFollowing(a)
  const isFollowerUserA = isFollower(a)
  const isFollowingUserB = isFollowing(b)
  // const isFollowerUserB = isFollower(b)
  return isFollowingUserA ? -1 : isFollowingUserB ? 1 : isFollowerUserA ? -1 : 1
}
