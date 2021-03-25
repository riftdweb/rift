import { createLocalStorageStateHook } from 'use-local-storage-state'

export const useSelectedPortal = createLocalStorageStateHook('v0/selectedPortal', 'siasky.net')