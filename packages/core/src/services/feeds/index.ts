// import { createLogger } from '@riftdweb/logger'
import { db } from '../..'

// const log = createLogger('rx/feeds')

export async function getFeedEntries(id: string) {
  const feed = await db.feeds.findOne(id).exec()
  const entries = await db.entries.findByIds(feed.entryIds)
  const list = []
  entries.forEach((entry) => {
    list.push(entry)
  })
  return list
}

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

  // const activity = useFeedActivity({ ref })
  // const top = useFeedTop({ ref })
  // const latest = useFeedLatest({ ref, pendingUserEntries })
  // const user = useFeedUser({ ref, pendingUserEntries, setPendingUserEntries })

  export async function incrementKeywords(keywords) {
    db

      // setKeywords((state) => {
      //   keywords.forEach((keyword) => {
      //     const keywordCount = state[keyword] || 0
      //     nextState[keyword] = keywordCount + 1
      //   })
      //   return nextState
      // })
    }

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
