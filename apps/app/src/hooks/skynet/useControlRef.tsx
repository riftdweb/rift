import { RefObject, useRef } from 'react'
import { SWRResponse } from 'swr'
import { User } from '../users'
import { Api } from './buildApi'

const controlRefDefaults = {
  Api: undefined as Api | undefined,
  userId: undefined as string | undefined,
  viewingUserId: undefined as string | undefined,
  followings: [] as User[],
  domains: {} as {
    [domain: string]: number
  },
  keywords: {} as {
    [keyword: string]: number
  },
  loadingState: undefined as string | undefined,
  setLoadingState: (state?: string) => {},
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
export type ControlRef = RefObject<typeof controlRefDefaults>

export function useControlRef() {
  const ref = useRef(controlRefDefaults)
  return ref
}
