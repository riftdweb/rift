import * as CAF from 'caf'
import { createLogger } from '../../shared/logger'
import { RequestQueue } from '../../shared/requestQueue'
import { wait } from '../../shared/wait'
import { ControlRef } from '../skynet/useControlRef'
import { cacheAllEntries, fetchAllEntries } from './shared'
import { clearToken, handleToken } from './tokens'
import { Entry, WorkerParams } from './types'
import { workerFeedActivityUpdate } from './workerFeedActivity'
import { workerFeedTopUpdate } from './workerFeedTop'

const log = createLogger('feed/latest/update')
const cafFeedLatestUpdate = CAF(function* feedLatestUpdate(
  signal: any,
  ref: ControlRef,
  newEntries: Entry[],
  params: WorkerParams
) {
  const { delay } = params
  try {
    log('Fetching all entries')
    if (delay) {
      yield wait(delay)
    }
    ref.current.feeds.latest.setLoadingState('Compiling feed')
    let allEntriesFeed = yield fetchAllEntries(ref)
    let allEntries = allEntriesFeed.entries

    allEntries = replaceEntriesBatchByUserId(allEntries, newEntries)

    log('Caching all entries')
    ref.current.feeds.latest.setLoadingState('Caching feed')
    yield cacheAllEntries(ref, allEntries)
  } finally {
    log('Finally')
    if (signal.aborted) {
      log('Aborted')
    }
    clearToken(ref, 'feedLatestUpdate')
    ref.current.feeds.latest.setLoadingState()
  }
})

export async function feedLatestUpdate(
  ref: ControlRef,
  entriesBatch: Entry[],
  params: WorkerParams = {}
): Promise<any> {
  try {
    const token = await handleToken(ref, 'feedLatestUpdate')
    await cafFeedLatestUpdate(token.signal, ref, entriesBatch, params)
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  }
}

const requestQueue = RequestQueue('feed/latest', 1)

export async function workerFeedLatestUpdate(
  ref: ControlRef,
  entriesBatch: Entry[],
  params: WorkerParams = {}
): Promise<any> {
  const task = () => feedLatestUpdate(ref, entriesBatch, params)
  await requestQueue.append(task)

  // Only mutate the latest feed if there are no user posts being saved,
  // this is to prevent optimistic updates from flickering.
  if (!ref.current.pendingUserPosts) {
    log('Fetching feed')
    ref.current.feeds.latest.response.mutate()
  } else {
    log('Skip fetching feed')
  }
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

export async function scheduleFeedLatestUpdate(ref: ControlRef) {
  // log('Trying feed latest update')

  const entriesBatch = entriesBuffer
  entriesBuffer = []
  if (entriesBatch.length) {
    log(`Running feed latest update: ${entriesBatch.length}`)
    await workerFeedLatestUpdate(ref, entriesBatch, {})

    if (requestQueue.queue.length === 0) {
      Promise.all([
        workerFeedTopUpdate(ref, { force: true, delay: 1_000 }),
        workerFeedActivityUpdate(ref, { force: true, delay: 1_000 }),
      ])
    }
  } else {
    // log('No updates')
  }

  await wait(SCHEDULE_INTERVAL)
  scheduleFeedLatestUpdate(ref)
  return
}
