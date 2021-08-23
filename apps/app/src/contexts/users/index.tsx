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
import { syncUser } from '../../workers/user'
import { Feed } from '@riftdweb/types'
import { TaskQueue } from '../../shared/taskQueue'
import { syncUserFeed } from '../../workers/user/resources/feed'
import { IUser, UsersMap } from '@riftdweb/types'
import { cacheUsersMap, fetchUsersMap } from '../../workers/workerApi'
import { ControlRef } from '../skynet/ref'
import { createLogger } from '../../shared/logger'
import { suggestionList } from './suggestionList'
import { seedList } from './seedList'
import { denyList } from './denyList'
import { apiLimiter } from '../skynet/api'
import { recomputeFollowers } from '../../workers/workerUsersIndexer'
import { buildUser } from '../../workers/user/buildUser'
import { checkIsUserUpToDate } from '../../workers/user/checks'
import { getDataKeyUsers } from '../../shared/dataKeys'
import { clearAllTokens } from '../../workers/tokens'
import { EntriesResponse } from '../../components/_shared/EntriesState'
import { useKey } from '../../hooks/useKey'

const log = createLogger('context/users')
const taskQueue = TaskQueue('users')
const dataKeyUsers = getDataKeyUsers()

const debouncedMutate = debounce((mutate) => {
  return mutate()
}, 5000)

const usersMapTaskQueue = TaskQueue('usersMap', {
  maxQueueSize: 1,
  dropStrategy: 'earliest',
})

const throttledCacheUsersMap = throttle(
  async (ref: ControlRef, userMap: UsersMap) => {
    const task = async () => {
      try {
        log('Caching usersMap start')
        await cacheUsersMap(ref, userMap)
        log('Caching usersMap done')
      } catch (e) {
        log('Error caching usersMap', e)
      }
    }
    return usersMapTaskQueue.add(task, {
      meta: {
        operation: 'set',
      },
    })
  },
  2_000
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
  discoveredUsersIndex: IUser[]
  indexedUsersIndex: IUser[]
  pendingUserIds: string[]
  isInitUsersComplete: boolean
  userCounts: {
    discovered: number
    hasBeenIndexed: number
    neverBeenIndexed: number
    pendingIndexing: number
    pendingReindexing: number
  }
  allFollowing: SWRResponse<Feed<string>, any>
  friends: EntriesResponse<string>
  following: EntriesResponse<string>
  suggestions: EntriesResponse<string>
  handleFollow: (userId: string) => void
  handleUnfollow: (userId: string) => void
}

const UsersContext = createContext({} as State)
export const useUsers = () => useContext(UsersContext)

type Props = {
  children: React.ReactNode
}

type InitState = {
  id: string
  step: number
}

type InitStateKey =
  | 'start'
  | 'hasFetchedUsersMap'
  | 'hasSeededUserIds'
  | 'complete'

const initStates: Record<InitStateKey, InitState> = {
  start: {
    id: 'start',
    step: 0,
  },
  hasFetchedUsersMap: {
    id: 'hasFetchedUsersMap',
    step: 1,
  },
  hasSeededUserIds: {
    id: 'hasSeededUserIds',
    step: 2,
  },
  complete: {
    id: 'complete', // hasFetchedFollowing
    step: 3,
  },
}

export function UsersProvider({ children }: Props) {
  const { myUserId, isReady, getKey, controlRef: ref, appDomain } = useSkynet()

  const [initState, _setInitState] = useState<InitState>(initStates.start)
  const setInitState = useCallback(
    (nextState: InitState) => {
      log(`Transitioning states: ${initState.id} to ${nextState.id}`)
      _setInitState(nextState)
    },
    [initState, _setInitState]
  )

  // Init step 1
  const usersMap = useSWR(
    getKey([appDomain, dataKeyUsers]),
    () => fetchUsersMap(ref),
    {
      revalidateOnFocus: false,
    }
  )

  // Reset when ready status becomes false because signed in user is changing
  useEffect(() => {
    if (!isReady) {
      setInitState(initStates.start)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady])

  useEffect(() => {
    if (initState.id === initStates.start.id && !!usersMap.data) {
      setInitState(initStates.hasFetchedUsersMap)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initState, usersMap])

  const discoveredUsersIndex = useMemo(() => {
    if (initState.id !== initStates.complete.id) {
      return []
    }
    return Object.entries(usersMap.data?.entries || {}).map(
      ([id, user]) => user
    )
  }, [initState, usersMap])

  const indexedUsersIndex = useMemo(() => {
    return discoveredUsersIndex
      .filter((user) => !!user && !!user.updatedAt)
      .sort(sortByRelationship)
  }, [discoveredUsersIndex])

  const getUsersPendingUpdate = useCallback(() => {
    return (
      discoveredUsersIndex
        // Filter out any thing that is fully up to date
        .filter((user) => {
          const check = checkIsUserUpToDate(ref, user, {
            level: 'index',
          })
          return !check.isUpToDate
        })
        // Filter out any thing that is fully up to date
        .sort((a, b) => sortByRelationship(a, b))
        .map(({ userId }) => userId)
    )
  }, [ref, discoveredUsersIndex])

  const pendingUserIds = useMemo(() => {
    return getUsersPendingUpdate()
  }, [getUsersPendingUpdate])

  const userCounts = useMemo(() => {
    const discoveredUsersCount = discoveredUsersIndex.length
    const indexedUsersCount = indexedUsersIndex.length
    const pendingIndexingUsersCount = pendingUserIds.length
    const neverBeenIndexed = discoveredUsersCount - indexedUsersCount

    return {
      discovered: discoveredUsersCount,
      hasBeenIndexed: indexedUsersCount,
      neverBeenIndexed: discoveredUsersCount - indexedUsersCount,
      pendingReindexing: pendingIndexingUsersCount - neverBeenIndexed,
      pendingIndexing: pendingIndexingUsersCount,
    }
  }, [discoveredUsersIndex, indexedUsersIndex, pendingUserIds])

  const getUser = useCallback(
    (userId: string): IUser => {
      if (initState.step < initStates.hasFetchedUsersMap.step) {
        throw Error('getUser was called before usersMap initialization')
      }
      return usersMap.data.entries[userId]
    },
    [initState, usersMap]
  )

  const upsertUser = useCallback(
    (user: { userId: string } & Partial<IUser>): Promise<void> => {
      const func = async () => {
        const nextUsersMap = await usersMap.mutate((data) => {
          const baseUser = buildUser(user.userId)
          const nextUser = {
            ...baseUser,
            ...(data.entries[user.userId] || {}),
            ...user,
            updatedAt: new Date().getTime(),
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
          mutate(getKey([getDataKeyUsers(user.userId)]))
        }, 1000)

        throttledCacheUsersMap(ref, nextUsersMap)
      }
      return func()
    },
    [ref, usersMap, getKey]
  )

  const upsertUsers = useCallback(
    (users: IUser[]): Promise<void> => {
      if (!users.length) {
        return
      }
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

        throttledCacheUsersMap(ref, nextUsersMap)
      }
      return func()
    },
    [ref, usersMap]
  )

  const addNewUserIds = useCallback(
    (userIds: string[]): Promise<void> => {
      if (initState.step < initStates.hasFetchedUsersMap.step) {
        throw Error('Cannot add keys before usersMap has fetched')
      }
      const func = async () => {
        const newUserIds = userIds
          .filter((userId) => !denyList.includes(userId))
          .filter((userId) => !getUser(userId))
        log('Adding', newUserIds)

        const newUsers = newUserIds.map(buildUser)
        await upsertUsers(newUsers)
      }
      return func()
    },
    [initState, getUser, upsertUsers]
  )

  // Init step 2
  // Seed any new user ids
  useEffect(() => {
    if (initState.id === initStates.hasFetchedUsersMap.id) {
      addNewUserIds(seedList)
      setInitState(initStates.hasSeededUserIds)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initState])

  // Init step 3
  const allFollowing = useSWR<Feed<string>>(
    initState.step >= initStates.hasSeededUserIds.step
      ? getKey([getDataKeyUsers('followingIds')])
      : null,
    async () => {
      if (!myUserId) {
        // Set init state to complete
        setInitState(initStates.complete)
        return {
          entries: [],
          updatedAt: 0,
        }
      } else {
        const task = async () => {
          try {
            // Sync myUser
            const user = await syncUser(ref, myUserId, 'get')
            // Add following user ids in case they do not exist yet (first time user)
            await addNewUserIds(user.following.data)
            // Recompute followers right away so that relationships work right away
            // before all users are fully synced
            await recomputeFollowers(ref)
            // Set init state to complete
            setInitState(initStates.complete)
            return {
              entries: user.following.data,
              updatedAt: user.following.updatedAt,
            }
          } catch (e) {
            log('Error', e)
            throw Error('Could not get followers')
          }
        }
        return apiLimiter.add(task, {
          priority: 4,
          meta: {
            id: myUserId,
            name: 'following',
            operation: 'get',
          },
        })
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  const [suggestionsKey, changeSuggestionsKey] = useKey()
  const suggestions = useMemo(() => {
    if (initState.id !== initStates.complete.id) {
      return {
        isValidating: true,
      }
    }

    if (!myUserId) {
      return {
        data: {
          entries: [],
          updatedAt: 0,
        },
      }
    }

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
        const user = ref.current.getUser(suggestionUserId)
        return !isFollowing(user)
      }
    )

    return {
      data: {
        entries: userIds,
        updatedAt: new Date().getTime(),
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, initState, myUserId, suggestionsKey])

  const friends = useMemo(() => {
    if (initState.id !== initStates.complete.id) {
      return {
        isValidating: true,
      }
    }
    return {
      data: {
        entries: discoveredUsersIndex
          .filter((user) => isFriend(user))
          .map(({ userId }) => userId),
        updatedAt: new Date().getTime(),
      },
    }
  }, [initState, discoveredUsersIndex])

  const following = useMemo(() => {
    if (initState.id !== initStates.complete.id) {
      return {
        isValidating: true,
      }
    }
    return {
      data: {
        entries: discoveredUsersIndex
          .filter((user) => isFollowing(user) && !isFriend(user))
          .map(({ userId }) => userId),
        updatedAt: new Date().getTime(),
      },
    }
  }, [initState, discoveredUsersIndex])

  const handleFollow = useCallback(
    (userId: string) => {
      if (!myUserId) {
        return
      }
      const func = async () => {
        log('Following user', userId)
        const user = getUser(userId) || buildUser(userId)

        // Optimistically we are now their follower
        await upsertUser({
          userId,
          followers: {
            ...user.followers,
            data: uniq([...user.followers.data, myUserId]),
          },
        })

        // Optimistically we are now following them
        const myUser = getUser(myUserId)
        await upsertUser({
          userId: myUserId,
          following: {
            data: uniq([...myUser.following.data, userId]),
            // Update time so that upcoming syncUser calls do not rollback optimistic data
            updatedAt: new Date().getTime(),
          },
        })

        await recomputeFollowers(ref)

        changeSuggestionsKey()

        await allFollowing.mutate(
          (data) => ({
            entries: uniq([...data.entries, userId]),
            updatedAt: new Date().getTime(),
          }),
          false
        )

        try {
          const follow = async () => {
            try {
              await socialDAC.follow(userId)
            } catch (e) {
              log('Failed to follow', e)
            }
          }

          await taskQueue.add(
            async () => {
              await apiLimiter.add(follow, {
                priority: 4,
                meta: {
                  id: userId,
                  operation: 'follow',
                },
              })
            },
            {
              meta: {
                id: userId,
                operation: 'follow',
              },
            }
          )

          if (taskQueue.queue.length === 0) {
            debouncedMutate(allFollowing.mutate)
          }

          // Trigger update user
          syncUserFeed(ref, userId, 4, 0)
        } catch (e) {
          log(`Error following user ${userId.slice(0, 5)}`, e)
        }
      }
      func()
    },
    [ref, myUserId, allFollowing, getUser, upsertUser, changeSuggestionsKey]
  )

  const handleUnfollow = useCallback(
    (userId: string) => {
      if (!myUserId) {
        return
      }
      const func = async () => {
        log('Unfollowing user', userId)
        const user = getUser(userId) || buildUser(userId)

        // Optimistically we are now not their follower
        await upsertUser({
          userId,
          followers: {
            ...user.followers,
            data: user.followers.data.filter((id) => id !== myUserId),
          },
        })

        // Optimistically we are now not following them
        const myUser = getUser(myUserId)
        await upsertUser({
          userId: myUserId,
          following: {
            data: myUser.following.data.filter((id) => id !== userId),
            // Update time so that upcoming syncUser calls do not rollback optimistic data
            updatedAt: new Date().getTime(),
          },
        })

        await recomputeFollowers(ref)

        await allFollowing.mutate(
          (data) => ({
            entries: data.entries.filter((id) => id !== userId),
            updatedAt: new Date().getTime(),
          }),
          false
        )

        try {
          const unfollow = async () => {
            try {
              await socialDAC.unfollow(userId)
            } catch (e) {
              log('Failed to unfollow', e)
            }
          }

          await taskQueue.add(
            async () => {
              await apiLimiter.add(unfollow, {
                priority: 4,
                meta: {
                  id: userId,
                  operation: 'unfollow',
                },
              })
            },
            {
              meta: {
                id: userId,
                operation: 'unfollow',
              },
            }
          )

          if (taskQueue.queue.length === 0) {
            debouncedMutate(allFollowing.mutate)
          }
        } catch (e) {
          log(`Error unfollowing user ${userId.slice(0, 5)}`, e)
        }
      }
      func()
    },
    [ref, myUserId, getUser, upsertUser, allFollowing]
  )

  const isInitUsersComplete = initState.id === initStates.complete.id

  useEffect(() => {
    ref.current.usersMap = usersMap
    ref.current.indexedUsersIndex = indexedUsersIndex
    ref.current.discoveredUsersIndex = discoveredUsersIndex
    ref.current.getUser = getUser
    ref.current.getUsersPendingUpdate = getUsersPendingUpdate
    ref.current.upsertUser = upsertUser
    ref.current.upsertUsers = upsertUsers
    ref.current.pendingUserIds = pendingUserIds
    ref.current.addNewUserIds = addNewUserIds
    ref.current.allFollowing = allFollowing
    ref.current.isInitUsersComplete = isInitUsersComplete
  }, [
    ref,
    allFollowing,
    suggestions,
    usersMap,
    discoveredUsersIndex,
    indexedUsersIndex,
    isInitUsersComplete,
    getUser,
    upsertUser,
    upsertUsers,
    getUsersPendingUpdate,
    pendingUserIds,
    addNewUserIds,
  ])

  // Dev helpers
  useEffect(() => {
    // @ts-ignore
    window.Rift = {
      // @ts-ignore
      ...(window.Rift || {}),
    }

    // @ts-ignore
    Rift = window.Rift

    // @ts-ignore
    Rift.clearAllTokens = () => clearAllTokens(ref)

    // @ts-ignore
    Rift.clearUsersMap = () => {
      const emptyData = {
        entries: {},
        updatedAt: 0,
      }
      cacheUsersMap(ref, emptyData, { priority: 4 })
      usersMap.mutate(emptyData, false)
    }

    // @ts-ignore
    Rift.getUser = getUser

    // @ts-ignore
    Rift.getUserStatus = (userId: string) => {
      const user = ref.current.getUser(userId)
      return checkIsUserUpToDate(ref, user, {
        verbose: true,
        level: 'index',
      })
    }

    // @ts-ignore
    Rift.userCount = () => {
      const count = ref.current.indexedUsersIndex.reduce(
        (acc, user) => (user.meta?.data.skapps['riftapp.hns'] ? acc + 1 : acc),
        0
      )
      console.log(
        `${count}/${userCounts.hasBeenIndexed}/${userCounts.discovered}`
      )
    }
  }, [ref, getUser, userCounts, usersMap])

  const value = {
    usersMap,
    indexedUsersIndex,
    discoveredUsersIndex,
    isInitUsersComplete,
    userCounts,
    pendingUserIds,
    addNewUserIds,
    allFollowing,
    following,
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
  const isFriendUserA = isFriend(a)
  const isFriendUserB = isFriend(b)
  const isFollowingUserA = isFollowing(a)
  const isFollowerUserA = isFollower(a)
  const isFollowingUserB = isFollowing(b)
  // const isFollowerUserB = isFollower(b)
  return isFriendUserA
    ? -1
    : isFriendUserB
    ? 1
    : isFollowingUserA
    ? -1
    : isFollowingUserB
    ? 1
    : isFollowerUserA
    ? -1
    : 1
}
