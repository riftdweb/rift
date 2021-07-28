import { Skyfile } from '@riftdweb/types'
import throttle from 'lodash/throttle'
import { useCallback, useEffect, useState } from 'react'
import { getDataKeyFiles } from '../shared/dataKeys'
import { useSkynet } from './skynet'
import { Api } from './skynet/buildApi'

const dataKeyFiles = getDataKeyFiles()

const throttledSyncState = throttle(async (Api: Api, state) => {
  try {
    console.log('syncing start', dataKeyFiles, state)
    await Api.setJSON({
      path: dataKeyFiles,
      json: state,
    })
    console.log('syncing success', dataKeyFiles, state)
  } catch (e) {
    console.log(e)
    console.log('syncing failed', dataKeyFiles, state)
  }
}, 5000)

export const useSkyfilesState = () => {
  const [localState, setLocalState] = useState<Skyfile[]>([])
  const { Api, identityKey } = useSkynet()

  const fetchData = useCallback(() => {
    const func = async () => {
      try {
        const { data } = await Api.getJSON<Skyfile[]>({
          path: dataKeyFiles,
        })
        // console.log(data)
        setLocalState(data || ([] as Skyfile[]))
      } catch (e) {
        console.log('getJSON failed', e)
        setTimeout(() => {
          // Error, probably too many requests, try again
          fetchData()
        }, 5000)
      }
    }
    func()
  }, [Api, setLocalState])

  // Only called successfully once on init, or when identity key changes
  useEffect(() => {
    if (identityKey) {
      setLocalState([] as Skyfile[])
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // console.log('nextState', dataKeyFiles, _nextState)
        setLocalState(_nextState)
        syncState(_nextState)
      }
    },
    [setLocalState, syncState]
  )

  return {
    skyfiles: localState,
    setSkyfiles,
    refetchSkyfiles,
  }
}
