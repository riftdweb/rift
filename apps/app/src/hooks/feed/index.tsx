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
import { workerRoot } from './workerRoot'
import { workerFeedUserUpdate } from './workerFeedUser'
import { ActivityFeed, Entry, EntryFeed } from './types'
import { workerFeedTopUpdate } from './workerFeedTop'
import { workerFeedActivityUpdate } from './workerFeedActivity'
import { createLogger } from '../../shared/logger'
import { useParamUserId } from './useParamUserId'
import { useFeedActivity } from './useFeedActivity'
import { useFeedLatest } from './useFeedLatest'
import { useFeedTop } from './useFeedTop'
import { useFeedUser } from './useFeedUser'
import { workerCrawlerUsers } from './workerCrawlerUsers'

const log = createLogger('feed')

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
  const { myUserId, isReseting, isInitializing, controlRef: ref } = useSkynet()
  const viewingUserId = useParamUserId()

  const [keywords, setKeywords] = useLocalStorageState<{
    [keyword: string]: number
  }>(`${RESOURCE_DATA_KEY}/keywords`, {})
  const [domains, setDomains] = useLocalStorageState<{
    [domain: string]: number
  }>(`${RESOURCE_DATA_KEY}/domains`, {})

  const [nonIdealState, setNonIdealState] = useState<string>()

  const activity = useFeedActivity({ ref })
  const latest = useFeedLatest({ ref })
  const top = useFeedTop({ ref })
  const user = useFeedUser({ ref })

  // Update controlRef
  useEffect(() => {
    ref.current.nonIdealState = nonIdealState
    ref.current.setNonIdealState = setNonIdealState
    ref.current.keywords = keywords
    ref.current.domains = domains
    ref.current.viewingUserId = viewingUserId
  }, [ref, viewingUserId, keywords, domains, nonIdealState, setNonIdealState])

  useEffect(() => {
    if (isInitializing || isReseting) {
      return
    }
    workerRoot(ref)
  }, [ref, isInitializing, isReseting])

  const refreshTopFeed = useCallback(() => {
    const func = async () => {
      await workerFeedTopUpdate(ref, { force: true })
    }
    return func()
  }, [ref])

  const refreshLatestFeed = useCallback(() => {
    const func = async () => {
      // Could start workerFeedLatestUpdate, but this probably makes more sense
      await workerCrawlerUsers(ref, { force: true })
    }
    return func()
  }, [ref])

  const refreshActivity = useCallback(() => {
    const func = async () => {
      await workerFeedActivityUpdate(ref, { force: true })
    }
    return func()
  }, [ref])

  const refreshUser = useCallback(
    (userId: string) => {
      const func = async () => {
        try {
          await workerFeedUserUpdate(ref, userId, {
            force: true,
            prioritize: true,
          })
        } catch (e) {}
      }
      return func()
    },
    [ref]
  )

  // If cached user feed returns null flag true, the user feed has never been compiled.
  // Check this whenever the response data changes.
  useEffect(() => {
    if (!user.loadingStateCurrentUser && user.response.data?.null) {
      log(`Building a feed for ${viewingUserId}`)
      refreshUser(viewingUserId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.response.data])

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
      const localLog = log.createLogger('createPost')
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
          isPending: true,
        } as unknown) as Entry

        try {
          localLog('Optimistic updates')
          // Incrementing this value prevents feeds from refetching
          ref.current.pendingUserPosts += 1

          // Optimistically update local latest feed
          latest.response.mutate(
            (data) => ({
              updatedAt: data.updatedAt,
              entries: [pendingPost, ...data.entries],
            }),
            false
          )

          // Optimistically update local user feed
          user.response.mutate(
            (data) => ({
              updatedAt: data.updatedAt,
              entries: [pendingPost, ...data.entries],
            }),
            false
          )

          localLog('Feed DAC createPost')
          // Create post
          await feedDAC.createPost({ text })

          localLog('Start user feed update')
          await workerFeedUserUpdate(ref, myUserId, {
            force: true,
            prioritize: true,
          })
        } finally {
          ref.current.pendingUserPosts -= 1
        }
      }
      func()
    },
    [ref, latest, user, myUserId]
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

  // @ts-ignore
  window.feed = value

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>
}
