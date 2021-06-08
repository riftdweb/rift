import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { SWRResponse } from 'swr'
import useLocalStorageState from 'use-local-storage-state'
import { v4 as uuid } from 'uuid'
import { feedDAC, useSkynet } from '../skynet'
import { workerFeeds } from './workerFeeds'
import { updateUserData } from './workerFeedUser'
import { ActivityFeed, Entry, EntryFeed } from './types'
import { workerFeedTop } from './workerFeedTop'
import { workerFeedActivity } from './workerFeedActivity'
import { logger } from '../../shared/logger'
import { useParamUserId } from './useParamUserId'
import { useFeedActivity } from './useFeedActivity'
import { useFeedAll } from './useFeedAll'
import { useFeedTop } from './useFeedTop'
import { useFeedUser } from './useFeedUser'
import { useUsers } from '../users'

const RESOURCE_DATA_KEY = 'feed'

type Mode = 'latest' | 'top'

type State = {
  current: {
    response: SWRResponse<EntryFeed, any>
    loadingState?: string
    setLoadingState: (state?: string) => void
  }
  top: {
    response: SWRResponse<EntryFeed, any>
    loadingState?: string
    setLoadingState: (state?: string) => void
  }
  latest: {
    response: SWRResponse<EntryFeed, any>
    loadingState?: string
    setLoadingState: (state?: string) => void
  }
  activity: {
    response: SWRResponse<ActivityFeed, any>
    loadingState?: string
    setLoadingState: (state?: string) => void
  }
  user: {
    response: SWRResponse<EntryFeed, any>
    loadingStateCurrentUser?: string
    getLoadingState: (userId: string) => string
    setLoadingState: (userId: string, state?: string) => void
  }

  // refresh methods
  refreshTopFeed: () => void
  refreshLatestFeed: () => void
  refreshCurrentFeed: () => void
  refreshActivity: () => void
  refreshUser: (userId) => void

  loadingState?: string
  setLoadingState: (state: string) => void

  createPost: ({ text: string }) => void
  incrementKeywords: (keywords: string[]) => void
  setKeywordValue: (keyword: string, value: number) => void
  incrementDomain: (domain: string) => void
  decrementDomain: (domain: string) => void

  // data
  userId?: string

  // algorithm data
  keywords: { [keyword: string]: number }
  domains: { [domain: string]: number }

  // config methods
  isVisibilityEnabled: boolean
  setIsVisibilityEnabled: (val: boolean) => void
  mode: 'latest' | 'top'
  setMode: (mode: Mode) => void
}

const FeedContext = createContext({} as State)
export const useFeed = () => useContext(FeedContext)

type Props = {
  children: React.ReactNode
}

export function FeedProvider({ children }: Props) {
  const {
    Api,
    userId: myUserId,
    isReseting,
    isInitializing,
    controlRef: ref,
  } = useSkynet()
  const viewingUserId = useParamUserId()
  const { followings } = useUsers()

  const [keywords, setKeywords] = useLocalStorageState<{
    [keyword: string]: number
  }>(`${RESOURCE_DATA_KEY}/keywords`, {})
  const [domains, setDomains] = useLocalStorageState<{
    [domain: string]: number
  }>(`${RESOURCE_DATA_KEY}/domains`, {})

  const [loadingState, setLoadingState] = useState<string>()
  const activity = useFeedActivity({ ref })
  const latest = useFeedAll({ ref })
  const top = useFeedTop({ ref })
  const user = useFeedUser({ ref })

  // Update controlRef
  useEffect(() => {
    ref.current.loadingState = loadingState
    ref.current.setLoadingState = setLoadingState
    ref.current.viewingUserId = viewingUserId
    ref.current.followings = followings
    ref.current.keywords = keywords
    ref.current.domains = domains
    ref.current.feeds = {
      latest: latest,
      top: top,
      activity: activity,
      user: user,
    }
  }, [
    Api,
    viewingUserId,
    myUserId,
    keywords,
    domains,
    latest,
    top,
    activity,
    user,
    loadingState,
    followings,
    setLoadingState,
  ])

  useEffect(() => {
    if (isInitializing || isReseting) {
      return
    }
    workerFeeds(ref)
  }, [isInitializing, isReseting])

  const refreshTopFeed = useCallback(() => {
    const func = async () => {
      await workerFeedTop(ref, { force: true })
    }
    func()
  }, [])

  const refreshLatestFeed = useCallback(() => {
    const func = async () => {
      await workerFeedTop(ref, { force: true })
    }
    func()
  }, [])

  const refreshActivity = useCallback(() => {
    const func = async () => {
      await workerFeedActivity(ref, { force: true })
    }
    return func()
  }, [])

  const refreshUser = useCallback((userId: string) => {
    const func = async () => {
      await updateUserData(ref, userId)
    }
    return func()
  }, [])

  // If cached user feed returns null flag true,
  // the user feed has never been compiled
  useEffect(() => {
    if (!user.loadingStateCurrentUser && user.response.data?.null) {
      logger('feed', `building a feed for ${viewingUserId}`)
      refreshUser(viewingUserId)
    }
  }, [user])

  const incrementKeywords = useCallback(
    (keywords) => {
      setKeywords((state) => {
        const nextState = {
          ...state,
        }
        keywords.forEach((keyword) => {
          const keywordCount = state[keyword] || 0
          nextState[keyword] = keywordCount + 1
        })
        return nextState
      })
    },
    [setKeywords]
  )

  const setKeywordValue = useCallback(
    (keyword: string, value: number) => {
      setKeywords((state) => {
        const nextState = {
          ...state,
        }
        nextState[keyword] = value
        return nextState
      })
    },
    [setKeywords]
  )

  const incrementDomain = useCallback(
    (domain) => {
      setDomains((state) => {
        const nextState = {
          ...state,
        }
        const domainCount = state[domain] || 0
        nextState[domain] = domainCount + 1
        return nextState
      })
    },
    [setDomains]
  )

  const decrementDomain = useCallback(
    (domain) => {
      setDomains((state) => {
        const nextState = {
          ...state,
        }
        const domainCount = state[domain] || 0
        nextState[domain] = domainCount - 1
        return nextState
      })
    },
    [setDomains]
  )

  const [isVisibilityEnabled, setIsVisibilityEnabled] = useState<boolean>(false)
  const [mode, setMode] = useState<Mode>('top')

  const createPost = useCallback(
    ({ text }: { text: string }) => {
      const func = async () => {
        const cid = uuid()
        const pendingPost = ({
          userId: myUserId,
          post: {
            // skystandards is number
            id: cid,
            content: {
              text,
            },
            ts: new Date().getTime(),
          },
        } as unknown) as Entry

        // Optimistically update local latest feed
        latest.response.mutate((data) => ({
          updatedAt: data.updatedAt,
          entries: [pendingPost, ...data.entries],
        }))

        // Optimistically update local user feed
        user.response.mutate((data) => ({
          updatedAt: data.updatedAt,
          entries: [pendingPost, ...data.entries],
        }))

        // Create post
        await feedDAC.createPost({ text })

        // Update all entries and user entries caches
        await updateUserData(ref, myUserId)
      }
      func()
    },
    [latest, user, myUserId]
  )

  const current = useMemo(() => (mode === 'latest' ? latest : top), [
    mode,
    latest,
    top,
  ])

  const refreshCurrentFeed = useMemo(
    () => (mode === 'latest' ? refreshLatestFeed : refreshTopFeed),
    [mode, refreshLatestFeed, refreshTopFeed]
  )

  const value = {
    current,
    latest,
    top,
    activity,
    user,
    loadingState,
    setLoadingState,
    refreshCurrentFeed,
    refreshTopFeed,
    refreshLatestFeed,
    refreshActivity,
    refreshUser,
    userId: viewingUserId,
    createPost,
    keywords,
    domains,
    incrementKeywords,
    setKeywordValue,
    incrementDomain,
    decrementDomain,
    isVisibilityEnabled,
    setIsVisibilityEnabled,
    mode,
    setMode,
  }

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>
}
