import { RefObject, useRef } from 'react'
import { SWRResponse } from 'swr'
import { ActivityFeed, EntryFeed } from '../feed/types'
import { User } from '../users'
import { Api } from './buildApi'

type TokenKey =
  | 'feedLatestUpdate'
  | 'feedTopUpdate'
  | 'feedActivityUpdate'
  | 'crawlerUsers'
  | 'afterFeedUserUpdate'
  | string

const controlRefDefaults = {
  Api: undefined as Api | undefined,
  myUserId: undefined as string | undefined,
  viewingUserId: undefined as string | undefined,
  followingUserIds: {} as SWRResponse<string[], any>,
  allUsers: [] as User[],
  followingUserIdsHasFetched: false as boolean,
  pendingUserPosts: 0 as number,
  domains: {} as {
    [domain: string]: number
  },
  keywords: {} as {
    [keyword: string]: number
  },
  loadingState: undefined as string | undefined,
  setLoadingState: (state?: string) => {},
  nonIdealState: undefined as string | undefined,
  setNonIdealState: (state?: string) => {},
  tokens: {
    feedLatestUpdate: null,
    feedTopUpdate: null,
    feedActivityUpdate: null,
    crawlerUsers: null,
    feedUserUpdate: null,
    afterFeedUserUpdate: null,
  } as Record<TokenKey, any>,
  feeds: {} as {
    user: {
      response: SWRResponse<EntryFeed, any>
      getLoadingState: (userId: string) => string
      setLoadingState: (userId: string, state?: string) => void
    }
    top: {
      response: SWRResponse<EntryFeed, any>
      loadingState: string
      setLoadingState: (state?: string) => void
    }
    latest: {
      response: SWRResponse<EntryFeed, any>
      loadingState: string
      setLoadingState: (state?: string) => void
    }
    activity: {
      response: SWRResponse<ActivityFeed, any>
      loadingState: string
      setLoadingState: (state?: string) => void
    }
  },
}
export type ControlRefDefaults = typeof controlRefDefaults
export type ControlRef = RefObject<ControlRefDefaults>

export function useControlRef() {
  const ref = useRef(controlRefDefaults)
  return ref
}
