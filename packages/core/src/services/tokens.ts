import CAF from 'caf'
import { createLogger } from '@riftdweb/logger'

const log = createLogger('clearToken')

type TokenKey =
  | 'feedAggregator'
  | 'feedTopUpdate'
  | 'feedActivityUpdate'
  | 'userIndexer'
  | string

const tokens: Record<TokenKey, any> = {}

export function getToken(tokenKey: TokenKey) {
  return tokens[tokenKey]
}

export async function handleToken(tokenKey: TokenKey): Promise<any> {
  await clearToken(tokenKey)

  const token = new CAF.cancelToken()
  // @ts-ignore
  window[tokenKey] = token
  tokens[tokenKey] = token
  return token
}

export async function clearToken(tokenKey: TokenKey): Promise<void> {
  const existingToken = tokens[tokenKey]

  try {
    if (existingToken) {
      // Abort any running task
      existingToken.abort()
      existingToken.discard()
      tokens[tokenKey] = null
      delete tokens[tokenKey]
    }
  } catch (e) {
    log('Error', e)
  }
}

export async function clearAllTokens() {
  const promises = Object.keys(tokens).map((key) => {
    log(`Clearing ${key}`)
    return clearToken(key)
  })
  await Promise.all(promises)
}
