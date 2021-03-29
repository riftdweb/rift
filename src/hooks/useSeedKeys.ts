import { useCallback, useMemo } from 'react'
import uniq from 'lodash/uniq'
import filter from 'lodash/filter'
import { createLocalStorageStateHook } from 'use-local-storage-state'

const useSeedKeyMap = createLocalStorageStateHook('v0/keys', {})

export const useSeedKeys = (seed: string) => {
  const [seedKeyMap, setSeedKeyMap] = useSeedKeyMap()

  const addKey = useCallback(
    (key: string) => {
      if (!key) {
        return
      }
      const cleanKey = key.trim()
      if (!cleanKey) {
        return
      }

      const keyList = seedKeyMap[seed] || []

      setSeedKeyMap({
        ...seedKeyMap,
        [seed]: uniq(keyList.concat(cleanKey)),
      })
    },
    [seed, seedKeyMap, setSeedKeyMap]
  )

  const removeKey = useCallback(
    (key: string) => {
      if (!key) {
        return
      }

      const keyList = seedKeyMap[seed] || []

      setSeedKeyMap({
        ...seedKeyMap,
        [seed]: filter(keyList, (item) => item !== key),
      })
    },
    [seed, seedKeyMap, setSeedKeyMap]
  )
  const keys = useMemo(() => seedKeyMap[seed] || [], [seed, seedKeyMap])

  return {
    keys,
    addKey,
    removeKey,
  }
}
