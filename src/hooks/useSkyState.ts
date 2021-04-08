import { useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'
import { getJSON, setJSON } from '../shared/skynet'
import { useSelectedPortal } from './useSelectedPortal'
import throttle from 'lodash/throttle'
import { useLocalRootSeed } from './useLocalRootSeed'

// TODO make this parent hook instance-specific
const throttledSyncState = throttle(
  async (portal, seed, dataKey, state) => {
    try {
      console.log('syncing start', dataKey, state)
      await setJSON(portal, seed, dataKey, state)
      console.log('syncing success', dataKey, state)
    } catch (e) {
      console.log(e)
      console.log('syncing failed', dataKey, state)
    }
  },
  [5000]
)

export const useSkyState = <T>(
  seed: string,
  dataKey: string,
  defaultValue: T
) => {
  const [localState, setLocalState] = useState<T>(defaultValue)
  const [selectedPortal] = useSelectedPortal()

  const fetchData = useCallback(() => {
    const func = async () => {
      try {
        const { data } = await getJSON(selectedPortal, seed, dataKey)
        if (data) {
          setLocalState(data)
        }
      } catch (e) {
        console.log(e)
      }
    }
    func()
  }, [selectedPortal, seed, dataKey, setLocalState])

  // Only called successfully once on init
  useEffect(() => {
    fetchData()
  }, [])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  const syncState = useCallback(
    (nextState: T) => {
      throttledSyncState(selectedPortal, seed, dataKey, nextState)
    },
    [selectedPortal, seed, dataKey]
  )

  const setState = useCallback(
    (_nextState: T | ((state: T) => T)) => {
      if (typeof _nextState === 'function') {
        setLocalState((_localState) => {
          // @ts-ignore
          const nextState = _nextState(_localState)
          // console.log('nextState', dataKey, nextState)
          syncState(nextState)
          return nextState
        })
      } else {
        // console.log('nextState', dataKey, _nextState)
        setLocalState(_nextState)
        syncState(_nextState)
      }
    },
    [localState, setLocalState]
  )

  return {
    state: localState,
    setState,
    refetch,
  }
}
