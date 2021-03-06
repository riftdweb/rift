import { Skyfile } from '@riftdweb/types'
import { createLogger } from '@riftdweb/logger'
import { TaskQueue } from '@riftdweb/queue'
import debounce from 'lodash/debounce'
import { useCallback, useEffect, useState } from 'react'
import { getDataKeyFiles } from '../shared/dataKeys'
import { useSkynet } from '../contexts/skynet'
import { Api } from '../contexts/skynet/api'

const dataKeyFiles = getDataKeyFiles()

const taskQueue = TaskQueue('skyfiles', {
  maxQueueSize: 1,
})

const log = createLogger('skyfiles')

const debouncedSyncState = debounce(async (Api: Api, state) => {
  log('Sync State task created')
  const task = async () => {
    try {
      log('Syncing start')
      await Api.setJSON({
        path: dataKeyFiles,
        json: state,
        priority: 4,
      })
      log('Syncing success')
    } catch (e) {
      log('Syncing failed', e)
    }
  }
  await taskQueue.add(task, {
    meta: {
      operation: 'sync',
    },
  })
}, 5000)

export const useSkyfilesState = () => {
  const [localState, setLocalState] = useState<Skyfile[]>([])
  const { Api, identityKey } = useSkynet()

  const fetchData = useCallback(() => {
    const func = async () => {
      try {
        const { data } = await Api.getJSON<Skyfile[]>({
          path: dataKeyFiles,
          priority: 4,
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

  const maybeSyncState = useCallback(
    (prevState: Skyfile[], nextState: Skyfile[]) => {
      const prevCompleteCount = prevState.filter(
        (file) => file.upload.status === 'complete'
      ).length
      const nextCompleteCount = nextState.filter(
        (file) => file.upload.status === 'complete'
      ).length
      if (prevCompleteCount !== nextCompleteCount) {
        log(
          'Triggering debounced sync state',
          'Prev',
          prevCompleteCount,
          'Next',
          nextCompleteCount
        )
        debouncedSyncState(Api, nextState)
      }
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
          maybeSyncState(_localState, nextState)
          return nextState
        })
      } else {
        // console.log('nextState', dataKeyFiles, _nextState)
        setLocalState(_nextState)
        maybeSyncState(localState, _nextState)
      }
    },
    [localState, setLocalState, maybeSyncState]
  )

  return {
    skyfiles: localState,
    setSkyfiles,
    refetchSkyfiles,
  }
}
