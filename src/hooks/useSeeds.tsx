import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import uniq from 'lodash/uniq'
import useSWR from 'swr'
import { getJSON, setJSON } from '../shared/skynet'
import { useSelectedPortal } from './useSelectedPortal'
import { useLocalRootSeed } from './useLocalRootSeed'
import { Seed } from '../shared/types'
import { upsertItem } from '../shared/collection'
import { deriveChildSeed } from 'skynet-js'
import { useRouter } from 'next/router'
import debounce from 'lodash/debounce'

const appResourceDataKey = 'seeds'

type State = {
  seeds: Seed[]
  addSeed: (seed: Seed) => boolean
  removeSeed: (seedId: string, redirect?: boolean) => void
  addKey: (seedId: string, key: string) => boolean
  removeKey: (seedId: string, key: string) => boolean
  isValidating: boolean
  userHasNoSeeds: boolean
}

const SeedsContext = createContext({} as State)
export const useSeeds = () => useContext(SeedsContext)

type Props = {
  children: React.ReactNode
}

const debouncedMutate = debounce((mutate) => {
  return mutate()
}, 5000)

export function SeedsProvider({ children }: Props) {
  const [selectedPortal] = useSelectedPortal()
  const { localRootSeed } = useLocalRootSeed()
  const [hasValidated, setHasValidated] = useState<boolean>(false)
  const [userHasNoSeeds, setUserHasNoSeeds] = useState<boolean>(false)
  const { push } = useRouter()

  const { data, mutate, isValidating, error } = useSWR<{ data: Seed[] }>(
    [localRootSeed, appResourceDataKey],
    () => getJSON(selectedPortal, localRootSeed, appResourceDataKey)
  )

  // Track whether the user has no seeds yet so that we can adjust
  // how data validating states are handled
  useEffect(() => {
    if (!hasValidated && data) {
      setHasValidated(true)
      setUserHasNoSeeds(!data.data || !data.data.length)
    }
  }, [data, hasValidated, setHasValidated, setUserHasNoSeeds])

  const seeds = useMemo(() => (data && data.data ? data.data : []), [data])

  const setSeeds = useCallback(
    (seeds: Seed[]) => {
      const func = async () => {
        // Update cache immediately
        mutate({ data: seeds }, false)
        // Save changes to SkyDB
        await setJSON(selectedPortal, localRootSeed, appResourceDataKey, seeds)
        // Sync latest, will likely be the same
        await debouncedMutate(mutate)
      }
      func()
    },
    [mutate]
  )

  const addSeed = useCallback(
    (seed: Seed): boolean => {
      if (!seed.parentSeed || !seed.name) {
        return false
      }
      const cleanParentSeed = seed.parentSeed.trim()
      if (!cleanParentSeed) {
        return false
      }
      const cleanSeedName = seed.name.trim()
      if (!cleanSeedName) {
        return false
      }
      const cleanChildSeed = seed.childSeed.trim()

      const seedId = cleanChildSeed
        ? deriveChildSeed(cleanParentSeed, cleanChildSeed)
        : cleanParentSeed

      const cleanSeed: Seed = {
        id: seedId,
        parentSeed: cleanParentSeed,
        name: cleanSeedName,
        childSeed: cleanChildSeed,
        addedAt: new Date().toISOString(),
        keys: seed.keys,
      }

      setSeeds(upsertItem(seeds, cleanSeed))
      return true
    },
    [seeds, setSeeds]
  )

  const addKey = useCallback(
    (seedId: string, key: string): boolean => {
      const seed = seeds.find((seed) => seed.id === seedId)

      if (!seed) {
        return false
      }

      const modifiedSeed = {
        ...seed,
        keys: uniq([...seed.keys, key]),
      }

      setSeeds(upsertItem(seeds, modifiedSeed))
      return true
    },
    [seeds, setSeeds]
  )

  const removeKey = useCallback(
    (seedId: string, key: string): boolean => {
      const seed = seeds.find((seed) => seed.id === seedId)

      if (!seed) {
        return false
      }

      const modifiedSeed = {
        ...seed,
        keys: seed.keys.filter((k) => k !== key),
      }

      setSeeds(upsertItem(seeds, modifiedSeed))
      return true
    },
    [seeds, setSeeds]
  )

  const removeSeed = useCallback(
    (id: string, redirect?: boolean) => {
      if (!id) {
        return
      }

      setSeeds(seeds.filter((item) => item.id !== id))

      if (redirect) {
        push('/skydb')
      }
    },
    [seeds, setSeeds]
  )

  const value = {
    seeds,
    addSeed,
    removeSeed,
    addKey,
    removeKey,
    isValidating,
    userHasNoSeeds,
  }

  return <SeedsContext.Provider value={value}>{children}</SeedsContext.Provider>
}
