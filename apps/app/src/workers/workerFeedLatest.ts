import * as CAF from 'caf'
import { createLogger } from '../shared/logger'
import { TaskQueue } from '../shared/taskQueue'
import { wait } from '../shared/wait'
import { ControlRef } from '../contexts/skynet/ref'
import { cacheAllEntries, fetchAllEntries } from './workerApi'
import { clearToken, handleToken } from './tokens'
import { Entry, EntryFeed, WorkerParams } from '@riftdweb/types'
import { workerFeedActivityUpdate } from './workerFeedActivity'
import { workerFeedTopUpdate } from './workerFeedTop'

const cafFeedLatestUpdate = CAF(function* feedLatestUpdate(
  signal: any,
  ref: ControlRef,
  newEntries: Entry[],
  params: WorkerParams
) {
  const log = createLogger('feed/latest/update', {
    workflowId: params.workflowId,
  })
  const { delay } = params
  try {
    log('Fetching all entries')
    if (delay) {
      yield wait(delay)
    }
    ref.current.feeds.latest.setLoadingState('Compiling feed')
    let allEntriesFeed: EntryFeed = yield fetchAllEntries(ref, {
      priority: params.priority,
    })
    let allEntries = allEntriesFeed.entries

    allEntries = replaceEntriesBatchByUserId(allEntries, newEntries)
    allEntries = cleanFeed(ref, allEntries)

    log('Caching all entries')
    ref.current.feeds.latest.setLoadingState('Caching feed')
    yield cacheAllEntries(ref, allEntries, {
      priority: params.priority,
    })
  } finally {
    log('Finally')
    if (signal.aborted) {
      log('Aborted')
    }
    clearToken(ref, 'feedLatestUpdate')
    ref.current.feeds.latest.setLoadingState()
  }
})

async function feedLatestUpdate(
  ref: ControlRef,
  entriesBatch: Entry[],
  params: WorkerParams = {}
): Promise<any> {
  const log = createLogger('feed/latest/update', {
    workflowId: params.workflowId,
  })
  try {
    const token = await handleToken(ref, 'feedLatestUpdate')
    await cafFeedLatestUpdate(token.signal, ref, entriesBatch, params)
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  }
}

const taskQueue = TaskQueue('feed/latest')

async function queueFeedLatestUpdate(
  ref: ControlRef,
  entriesBatch: Entry[],
  params: WorkerParams = {}
): Promise<any> {
  const log = createLogger('feed/latest/update', {
    workflowId: params.workflowId,
  })
  const task = () => feedLatestUpdate(ref, entriesBatch, params)
  await taskQueue.add(task, {
    meta: {
      name: 'batch',
      operation: 'update',
    },
  })

  // Only mutate the latest feed if there are no user posts being saved,
  // this is to prevent optimistic updates from flickering.
  if (!ref.current.pendingUserPosts) {
    log('Fetching feed')
    ref.current.feeds.latest.response.mutate()
  } else {
    log('Skip fetching feed')
  }
}

function cleanFeed(ref: ControlRef, allEntries: Entry[]) {
  return allEntries.filter((entry) =>
    [ref.current.myUserId, ...ref.current.allFollowing.data.entries].includes(
      entry.userId
    )
  )
}

function replaceEntriesBatchByUserId(
  allEntries: Entry[],
  newEntries: Entry[]
): Entry[] {
  const updatingUserIds = newEntries.reduce((acc, entry) => {
    if (!acc.includes(entry.userId)) {
      return acc.concat([entry.userId])
    }
    return acc
  }, [])

  // Remove existing user entries for all users being updated
  allEntries = allEntries.filter(
    (entry) => !updatingUserIds.includes(entry.userId)
  )

  return allEntries.concat(newEntries)
}

export function feedLatestAdd(entries: Entry[]): void {
  entriesBuffer = replaceEntriesBatchByUserId(entriesBuffer, entries)
}

export function clearEntriesBuffer() {
  entriesBuffer = []
}

// Holds multiple batches of user entries that get added to the latest entries
// on a schedule.
// When the user changes the buffer gets cleared, via a call to clearEntriesBuffer.
let entriesBuffer = []

const SCHEDULE_INTERVAL = 10_000

// All internal workers are priorty 3 because they should take precedence over
// routine indexing and do not happen often.
export async function scheduleFeedLatestUpdate(ref: ControlRef) {
  const log = createLogger('feed/latest/scheduler')

  const entriesBatch = entriesBuffer
  entriesBuffer = []
  if (entriesBatch.length) {
    log(`Running feed latest update: ${entriesBatch.length}`)
    await queueFeedLatestUpdate(ref, entriesBatch, {
      priority: 3,
    })

    if (taskQueue.queue.length === 0) {
      Promise.all([
        workerFeedTopUpdate(ref, { force: true, delay: 1_000, priority: 3 }),
        workerFeedActivityUpdate(ref, {
          force: true,
          delay: 1_000,
          priority: 3,
        }),
      ])
    }
  } else {
    // log('No updates')
  }

  await wait(SCHEDULE_INTERVAL)
  scheduleFeedLatestUpdate(ref)
  return
}
