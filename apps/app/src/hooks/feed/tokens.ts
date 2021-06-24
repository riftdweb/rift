import * as CAF from 'caf'
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
  const existingToken = ref.current.tokens[tokenKey]

  if (existingToken) {
    // Abort any running worker
    await ref.current.tokens[tokenKey].abort()
    ref.current.tokens[tokenKey].discard()
    ref.current.tokens[tokenKey] = null
  }
}

export async function clearAllTokens(ref) {
  await clearToken(ref, 'crawlerUsers')
  await clearToken(ref, 'feedUserUpdate')
  await clearToken(ref, 'feedLatestUpdate')
  await clearToken(ref, 'afterFeedUserUpdate')
}
