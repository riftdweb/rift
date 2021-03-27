import { useCallback, useMemo } from 'react'
import uniq from 'lodash/uniq'
import filter from 'lodash/filter'
import { createLocalStorageStateHook } from 'use-local-storage-state'

const useSeedsState = createLocalStorageStateHook<string[]>('v0/seeds', [])

export const useSeeds = () => {
  const [seeds, setSeeds] = useSeedsState()

  const addSeed = useCallback((seed: string) => {
    if (!seed) {
      return
    }
    const cleanSeed = seed.trim()
    if (!cleanSeed) {
      return
    }

    setSeeds(uniq(seeds.concat(cleanSeed)))
  }, [seeds, setSeeds])

  const removeSeed = useCallback((seed: string) => {
    if (!seed) {
      return
    }

    setSeeds(filter(seeds, (item) => item !== seed))
  }, [seeds, setSeeds])

  return {
    seeds,
    addSeed,
    removeSeed
  }
}