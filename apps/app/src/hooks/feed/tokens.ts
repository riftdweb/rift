import * as CAF from 'caf'
import { createLogger } from '../../shared/logger'
import { ControlRef, ControlRefDefaults } from '../skynet/useControlRef'

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
): Promise<any> {
  const log = createLogger('clearToken')

  const existingToken = ref.current.tokens[tokenKey]

  try {
  if (existingToken) {
    // Abort any running worker
    await existingToken.abort()
    existingToken.discard()
    ref.current.tokens[tokenKey] = null
  }
  } catch (e) {
    log('Error', e)
  }
}

export async function clearAllTokens(ref) {
  await clearToken(ref, 'crawlerUsers')
  await clearToken(ref, 'feedUserUpdate')
  await clearToken(ref, 'feedLatestUpdate')
  await clearToken(ref, 'afterFeedUserUpdate')
}
