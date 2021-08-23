import { Dispatch, SetStateAction } from 'react'
import { IUser, UsersMap } from '@riftdweb/types'
import { RefObject, useRef } from 'react'
import { SWRResponse } from 'swr'
import { Feed, ActivityFeed, EntryFeed } from '@riftdweb/types'
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
  allFollowing: {} as SWRResponse<Feed<string>, any>,
  usersMap: {} as SWRResponse<UsersMap, any>,
  isInitUsersComplete: false as boolean,
  indexedUsersIndex: [] as IUser[],
  discoveredUsersIndex: [] as IUser[],
  getUser: (userId: string): IUser => {
    throw Error('usersMap not yet loaded')
  },
  upsertUser: async (
    user: { userId: string } & Partial<IUser>
  ): Promise<void> => {},
  upsertUsers: async (user: IUser[]): Promise<void> => {},
  pendingUserIds: [] as string[],
  getUsersPendingUpdate: (() => []) as () => string[],
  setPendingUserIds: (() => {}) as Dispatch<SetStateAction<string[]>>,
  addNewUserIds: async (userIds: string[]): Promise<void> => {},
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
