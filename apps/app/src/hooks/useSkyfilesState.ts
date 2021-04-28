import { useCallback, useEffect, useState } from 'react'
import throttle from 'lodash/throttle'
import { useSkynet } from './skynet'
import { Skyfile } from '@riftdweb/types'
import { SKYFILES_DATA_KEY } from '../shared/dataKeys'

const throttledSyncState = throttle(async (Api, state) => {
  try {
    // console.log('syncing start', SKYFILES_DATA_KEY, state)
    await Api.setJSON({
      dataKey: SKYFILES_DATA_KEY,
      json: state,
    })
    // console.log('syncing success', SKYFILES_DATA_KEY, state)
  } catch (e) {
    console.log(e)
    // console.log('syncing failed', SKYFILES_DATA_KEY, state)
  }
}, 5000)

export const useSkyfilesState = () => {
  const [localState, setLocalState] = useState<Skyfile[]>([])
  const { Api, identityKey } = useSkynet()

  const fetchData = useCallback(() => {
    const func = async () => {
      try {
        const { data }: { data?: Skyfile[] } = ((await Api.getJSON({
          dataKey: SKYFILES_DATA_KEY,
        })) as unknown) as {
          data: Skyfile[]
        }
        // console.log(data)
        setLocalState(data || ([] as Skyfile[]))
      } catch (e) {
        console.log(e)
      }
    }
    func()
  }, [Api, setLocalState])

  // Only called successfully once on init, or when identity changes
  useEffect(() => {
    setLocalState([] as Skyfile[])
    fetchData()
  }, [identityKey])

  const refetchSkyfiles = useCallback(() => {
    fetchData()
  }, [fetchData])

  const syncState = useCallback(
    (nextState: Skyfile[]) => {
      throttledSyncState(Api, nextState)
    },
    [Api]
  )

  const setSkyfiles = useCallback(
    (_nextState: Skyfile[] | ((state: Skyfile[]) => Skyfile[])) => {
      if (typeof _nextState === 'function') {
        setLocalState((_localState) => {
          // @ts-ignore
          const nextState = _nextState(_localState)
          // console.log('nextState', nextState)
          syncState(nextState)
          return nextState
        })
      } else {
        // console.log('nextState', SKYFILES_DATA_KEY, _nextState)
        setLocalState(_nextState)
        syncState(_nextState)
      }
    },
    [localState, setLocalState]
  )

  return {
    skyfiles: localState,
    setSkyfiles,
    refetchSkyfiles,
  }
}
