import { createContext, useCallback, useContext } from 'react'
import useSWR from 'swr'
import { rankPosts } from './ranking'
import { Post, ProcessedPost } from './types'
import { useSkynet } from '../skynet'
import { getPosts } from './posts'
import useLocalStorageState from 'use-local-storage-state'
import { useState } from 'react'

const RESOURCE_DATA_KEY = 'feed'

type State = {
  rankedPosts: ProcessedPost[]
  keywords: { [keyword: string]: number }
  domains: { [domain: string]: number }
  incrementKeywords: (keywords: string[]) => void
  setKeywordValue: (keyword: string, value: number) => void
  incrementDomain: (domain: string) => void
  decrementDomain: (domain: string) => void
  isVisibilityEnabled: boolean
  setIsVisibilityEnabled: (val: boolean) => void
}

const FeedContext = createContext({} as State)
export const useFeed = () => useContext(FeedContext)

type Props = {
  children: React.ReactNode
}

export function FeedProvider({ children }: Props) {
  const { Api } = useSkynet()
  const [keywords, setKeywords] = useLocalStorageState<{
    [keyword: string]: number
  }>(`${RESOURCE_DATA_KEY}/keywords`, {})
  const [domains, setDomains] = useLocalStorageState<{
    [domain: string]: number
  }>(`${RESOURCE_DATA_KEY}/domains`, {})

  const { data: posts } = useSWR<Post[]>('posts', () => getPosts(Api))
  const { data: rankedPosts } = useSWR<ProcessedPost[]>(
    () => (posts ? [posts, keywords, domains] : null),
    () =>
      rankPosts(posts, {
        keywords,
        domains,
      })
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

  const value = {
    rankedPosts,
    keywords,
    domains,
    incrementKeywords,
    setKeywordValue,
    incrementDomain,
    decrementDomain,
    isVisibilityEnabled,
    setIsVisibilityEnabled,
  }

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>
}
