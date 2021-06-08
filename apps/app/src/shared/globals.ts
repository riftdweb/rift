import { SWRResponse } from 'swr'

export const globals = {
  Api: undefined as any,
  userId: undefined as string | undefined,
  domains: {} as {
    [domain: string]: number
  },
  keywords: {} as {
    [keyword: string]: number
  },
  response: {} as {
    [feedName: string]: SWRResponse<any, any>
  },
}
