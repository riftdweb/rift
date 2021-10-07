import { useCallback, useEffect } from 'react'
import { createLocalStorageStateHook } from 'use-local-storage-state'
import { v4 as uuid } from 'uuid'

const defaultValue = {
  uuid: uuid(),
}

const useLocalRootSeedHook = createLocalStorageStateHook<{ uuid: string }>(
  'v0/localRootSeed',
  defaultValue
)

export const useLocalRootSeed = () => {
  const [localRootSeed, setLocalRootSeed] = useLocalRootSeedHook()

  // Work around some sort of SSR localStorage issue
  // Issue only occurs for initial setting of seed
  // Unlikely to exist when running statically
  useEffect(() => {
    setTimeout(() => setLocalRootSeed(localRootSeed), 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const regenerate = useCallback(() => {
    setLocalRootSeed({
      uuid: uuid(),
    })
    window.location.href = '/'
  }, [setLocalRootSeed])

  return {
    localRootSeed: localRootSeed.uuid,
    setLocalRootSeed: (uuid: string) =>
      setLocalRootSeed({
        uuid,
      }),
    regenerate,
  }
}
