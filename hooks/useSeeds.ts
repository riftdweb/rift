import { useCallback, useMemo } from 'react'
import uniq from 'lodash/uniq'
import filter from 'lodash/filter'
import { createLocalStorageStateHook } from 'use-local-storage-state'

const useSeedsState = createLocalStorageStateHook('v0/seeds', [])

export const useSeeds = () => {
  const [seeds, setSeeds] = useSeedsState()

  const addSeed = useCallback((seed) => {
    if (!seed) {
      return
    }
    const cleanSeed = seed.trim()
    if (!cleanSeed) {
      return
    }

    setSeeds(uniq(seeds.concat(cleanSeed)))
  }, [seeds, setSeeds])

  const removeSeed = useCallback((seed) => {
    if (!seed) {
      return
    }

    console.log('remove ', seed)
    console.log(seeds[3])
    console.log(seed)
    console.log(seeds[3] == seed)
    console.log(seeds[3] === seed)
    const filtered = filter(seeds, (item) => item !== seed)
    console.log(filtered)
    setSeeds(filter(seeds, (item) => item !== seed))
  }, [seeds, setSeeds])

  return [seeds, addSeed, removeSeed]
}