import { Dispatch, SetStateAction } from 'react'
import { IUser, UsersMap } from '@riftdweb/types'
import { RefObject, useRef } from 'react'
import { SWRResponse } from 'swr'
import { ActivityFeed, EntryFeed } from '@riftdweb/types'
import { Api } from './api'

type TokenKey =
  | 'feedLatestUpdate'
  | 'feedTopUpdate'
  | 'feedActivityUpdate'
  | 'feedIndexer'
  | 'networkUsers'
  | string

const controlRefDefaults = {
  Api: undefined as Api | undefined,
  myUserId: undefined as string | undefined,
  viewingUserId: undefined as string | undefined,

  // Users context
  followingUserIds: {} as SWRResponse<string[], any>,
  usersMap: {} as SWRResponse<UsersMap, any>,
  usersIndex: [] as IUser[],
  getUser: (_userId: string): IUser => {
    throw Error('usersMap not yet loaded')
  },
  upsertUser: (user: IUser): void => {},
  upsertUsers: (user: IUser[]): void => {},
  pendingUserIds: [] as string[],
  setPendingUserIds: (() => {}) as Dispatch<SetStateAction<string[]>>,
  addNewUserIds: (userIds: string[]): void => {},
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
    feedIndexer: null,
    userIndexer: null,
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
  // @ts-ignore
  window.ref = ref
  return ref
}
