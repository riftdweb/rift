import * as CAF from 'caf'
import { createLogger } from '../shared/logger'
import {
  ControlRef,
  ControlRefDefaults,
} from '../contexts/skynet/useControlRef'

export async function handleToken(
  ref: ControlRef,
  tokenKey: keyof ControlRefDefaults['tokens']
): Promise<any> {
  await clearToken(ref, tokenKey)

  const token = new CAF.cancelToken()
  // @ts-ignore
  window[tokenKey] = token
  ref.current.tokens[tokenKey] = token
  return token
}

export async function clearToken(
  ref: ControlRef,
  tokenKey: keyof ControlRefDefaults['tokens']
): Promise<void> {
  const log = createLogger('clearToken')

  const existingToken = ref.current.tokens[tokenKey]

  try {
    if (existingToken) {
      // Abort any running worker
      existingToken.abort()
      existingToken.discard()
      ref.current.tokens[tokenKey] = null
      delete ref.current.tokens[tokenKey]
    }
  } catch (e) {
    log('Error', e)
  }
}

export async function clearAllTokens(ref) {
  const promises = Object.keys(ref.current.tokens).map((key) =>
    clearToken(ref, key)
  )
  await Promise.all(promises)
}
