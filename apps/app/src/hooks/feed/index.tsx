import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import useSWR, { SWRResponse } from 'swr'
import useLocalStorageState from 'use-local-storage-state'
import { v4 as uuid } from 'uuid'
import { feedDAC, useSkynet } from '../skynet'
import { updateUserData, workerEntries } from './workerEntries'
import { Entry, EntryFeed } from './types'
import { globals } from '../../shared/globals'
import { fetchAllEntries, fetchTopEntries } from './shared'
import { workerFeed } from './workerFeed'

const RESOURCE_DATA_KEY = 'feed'

type Mode = 'latest' | 'top'

type State = {
  feedResponse: SWRResponse<EntryFeed, any>
  topFeedResponse: SWRResponse<EntryFeed, any>
  latestFeedResponse: SWRResponse<EntryFeed, any>
  refreshTopFeed: () => void
  createPost: ({ text: string }) => void
  keywords: { [keyword: string]: number }
  domains: { [domain: string]: number }
  incrementKeywords: (keywords: string[]) => void
  setKeywordValue: (keyword: string, value: number) => void
  incrementDomain: (domain: string) => void
  decrementDomain: (domain: string) => void
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
  const { userId: myUserId } = useSkynet()
  const [keywords, setKeywords] = useLocalStorageState<{
    [keyword: string]: number
  }>(`${RESOURCE_DATA_KEY}/keywords`, {})
  const [domains, setDomains] = useLocalStorageState<{
    [domain: string]: number
  }>(`${RESOURCE_DATA_KEY}/domains`, {})

  // Make data accessible to workers
  useEffect(() => {
    globals.keywords = keywords
    globals.domains = domains
  }, [keywords, domains])

  useEffect(() => {
    if (myUserId) {
      workerEntries()
    }
  }, [myUserId])

  const latestFeedResponse = useSWR<EntryFeed>('entries/latest', () =>
    fetchAllEntries()
  )
  const topFeedResponse = useSWR<EntryFeed>('entries/top', () =>
    fetchTopEntries()
  )

  const refreshTopFeed = useCallback(() => {
    const func = async () => {
      await workerFeed({ force: true })
      topFeedResponse.mutate()
    }
    func()
  }, [topFeedResponse])

  const createPost = useCallback(
    ({ text }: { text: string }) => {
      const func = async () => {
        // Optimistically update local latest entries
        latestFeedResponse.mutate((data) => ({
          updatedAt: data.updatedAt,
          entries: [
            {
              // TODO: What to do with id?
              id: uuid(),
              userId: myUserId,
              post: {
                content: {
                  text,
                },
                ts: new Date().getTime(),
              },
            } as Entry,
            ...data.entries,
          ],
        }))

        // TODO: Optimistically update local user entries

        // Create post
        await feedDAC.createPost({ text })

        // Update all entries and user entries caches
        updateUserData(myUserId)
      }
      func()
    },
    [latestFeedResponse, myUserId]
  )

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

  const feedResponse = useMemo(
    () => (mode === 'latest' ? latestFeedResponse : topFeedResponse),
    [mode, latestFeedResponse, topFeedResponse]
  )

  const value = {
    feedResponse,
    latestFeedResponse,
    topFeedResponse,
    refreshTopFeed,
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
