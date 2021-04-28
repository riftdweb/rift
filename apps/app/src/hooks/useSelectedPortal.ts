import { createLocalStorageStateHook } from 'use-local-storage-state'

export const useSelectedPortal = createLocalStorageStateHook<string>(
  'v0/selectedPortal',
  'siasky.net'
)
