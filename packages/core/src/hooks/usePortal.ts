import { useMemo } from 'react'
import { createLocalStorageStateHook } from 'use-local-storage-state'
import { portals as defaultPortals } from '../shared/portals'

export const useSelectedDevPortal = createLocalStorageStateHook<string>(
  'v0/devPortal',
  'web3portal.com'
)

export function usePortal() {
  const [devPortal, setDevPortal] = useSelectedDevPortal()
  const portal = useMemo(() => {
    const hostname = window.location.hostname
    if (
      hostname === 'localhost' ||
      hostname === 'riftapp' ||
      hostname.endsWith('.eth.link') ||
      hostname.endsWith('.eth')
    ) {
      return devPortal
    }
    const parts = hostname.split('.')
    // riftapp.hns.siasky.net
    //        hash.siasky.net
    //         www.siasky.net/hash
    //             siasky.net/hash

    if (parts.length === 1) {
      return devPortal
    }
    return parts.slice(parts.length - 2, parts.length).join('.')
  }, [devPortal])

  const portals = useMemo(() => {
    if (defaultPortals.find(({ domain }) => domain === portal)) {
      return defaultPortals
    }
    return [
      {
        domain: portal,
      },
      ...defaultPortals,
    ]
  }, [portal])

  return {
    portal,
    portals,
    setDevPortal,
  }
}
