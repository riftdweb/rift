import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ActivityFeed, Entry, EntryFeed } from '@riftdweb/types'
import { createLogger } from '@riftdweb/logger'
import { SWRResponse } from 'swr'
import useLocalStorageState from 'use-local-storage-state'
import { v4 as uuid } from 'uuid'
import { feedDAC, useSkynet } from '../skynet'
import { startRoot } from '../../services/root'
import { syncUserFeed } from '../../services/user/resources/feed'
import { updateTopFeed } from '../../services/top'
import { updateActivityFeed } from '../../services/activity'
import { useParamUserId } from './useParamUserId'
import { useFeedActivity } from './useFeedActivity'
import { useFeedLatest } from './useFeedLatest'
import { useFeedTop } from './useFeedTop'
import { useFeedUser } from './useFeedUser'

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

  createPost: ({ text: string }) => void
  pendingUserEntries: Entry[]
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
  const { myUserId, isReady, controlRef: ref } = useSkynet()
  const viewingUserId = useParamUserId()
  const [isVisibilityEnabled, setIsVisibilityEnabled] = useState<boolean>(false)
  const [mode, setMode] = useState<Mode>('top')
  const [pendingUserEntries, setPendingUserEntries] = useState<Entry[]>([])

  const [keywords, setKeywords] = useLocalStorageState<{
    [keyword: string]: number
  }>(`${RESOURCE_DATA_KEY}/keywords`, {})
  const [domains, setDomains] = useLocalStorageState<{
    [domain: string]: number
  }>(`${RESOURCE_DATA_KEY}/domains`, {})

  const [nonIdealState, setNonIdealState] = useState<string>()

  const activity = useFeedActivity({ ref })
  const top = useFeedTop({ ref })
  const latest = useFeedLatest({ ref, pendingUserEntries })
  const user = useFeedUser({ ref, pendingUserEntries, setPendingUserEntries })

  // Update controlRef
  useEffect(() => {
    ref.current.nonIdealState = nonIdealState
    ref.current.setNonIdealState = setNonIdealState
    ref.current.keywords = keywords
    ref.current.domains = domains
    ref.current.viewingUserId = viewingUserId
  }, [ref, viewingUserId, keywords, domains, nonIdealState, setNonIdealState])

  useEffect(() => {
    if (isReady) {
      startRoot(ref)
    }
  }, [ref, isReady])

  const refreshTopFeed = useCallback(() => {
    const func = async () => {
      await updateTopFeed(ref, { force: true, priority: 4 })
    }
    return func()
  }, [ref])

  const refreshLatestFeed = useCallback(() => {
    const func = async () => {
      // TODO: Is there anything to replace this call?
    }
    return func()
  }, [])

  const refreshActivity = useCallback(() => {
    const func = async () => {
      await updateActivityFeed(ref, { force: true, priority: 4 })
    }
    return func()
  }, [ref])

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
          setPendingUserEntries((entries) => entries.concat([pendingPost]))

          localLog('Feed DAC createPost')
          // Create post
          await feedDAC.createPost({ text })

          localLog('Start user feed update')
          await syncUserFeed(ref, myUserId, 4, 0)

          setPendingUserEntries((entries) =>
            entries.map((entry) => ({
              ...entry,
              isPending: false,
            }))
          )
        } catch (e) {
          localLog('Error', e)
          // If an error occurs, remove the pending entries
          setPendingUserEntries((entries) =>
            entries.filter(
              (entry) => ((entry.post.id as unknown) as string) !== cid
            )
          )
        }
      }
      func()
    },
    [ref, myUserId, setPendingUserEntries]
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
    pendingUserEntries,
    refreshTopFeed,
    refreshLatestFeed,
    refreshActivity,
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
