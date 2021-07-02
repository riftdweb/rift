import { RefObject, useRef } from 'react'
import { SWRResponse } from 'swr'
import { Api } from './buildApi'

const controlRefDefaults = {
  Api: undefined as Api | undefined,
  userId: undefined as string | undefined,
  viewingUserId: undefined as string | undefined,
  followingUserIds: {} as SWRResponse<string[], any>,
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
    feedUserUpdate: null,
    feedLatestUpdate: null,
    afterFeedUserUpdate: null,
    crawlerUsers: null,
  },
  feeds: {} as {
    user: {
      response: SWRResponse<any, any>
      getLoadingState: (userId: string) => string
      setLoadingState: (userId: string, state?: string) => void
    }
    [feedName: string]: {
      response: SWRResponse<any, any>
      loadingState?: string
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
