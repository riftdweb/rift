import { createLogger, Logger } from '@riftdweb/logger'
import { Entry, EntryFeed } from '@riftdweb/types'
import { TaskQueue } from '@riftdweb/queue'
import CAF from 'caf'
import { v4 as uuid } from 'uuid'
import { JSONResponse } from 'skynet-js'
import { ControlRef } from '../../../contexts/skynet/ref'
import { isFollowing } from '../../../contexts/users'
import { cacheUserEntries, compileUserEntries } from '../../serviceApi'
import { clearToken, handleToken } from '../../tokens'
import { addEntries } from '../../feedAggregator'
import { checkIsUpToDate } from '../checks'
import { getLogName, getTokenName } from '..'

const resourceName = 'feed'
// Keep pool a little bigger than the indexer batch size
// so higher priorty tasks can start right away.
const taskQueue = TaskQueue(`sync/${resourceName}`, {
  poolSize: 10,
  mode: 'dedupe',
})

const cafSyncUserFeed = CAF(function* (
  signal: any,
  ref: ControlRef,
  userId: string,
  priority: number,
  log: (...args: any[]) => void
): Generator<
  Promise<Entry[] | [void, EntryFeed] | EntryFeed | JSONResponse | void>,
  any,
  any
> {
  const params = {
    priority,
  }
  try {
    log('Running')
    ref.current.feeds.user.setLoadingState(userId, 'Loading feed')

    let user = ref.current.getUser(userId)

    log('Compiling entries')
    let compiledUserEntries: Entry[] = yield compileUserEntries(userId, params)

    const optimisticallyUpdateUserFeed = () => {
      if (userId !== ref.current.viewingUserId) {
        return
      }
      return ref.current.feeds.user.response.mutate(
        {
          entries: compiledUserEntries,
          updatedAt: new Date().getTime(),
        },
        false
      )
    }

    log('Caching and mutating entries, updating metadata')
    yield Promise.all([
      cacheUserEntries(ref, userId, compiledUserEntries, params),
      optimisticallyUpdateUserFeed(),
    ])

    yield ref.current.upsertUser({
      userId,
      feed: {
        updatedAt: new Date().getTime(),
        data: {
          count: compiledUserEntries.length,
        },
      },
    })

    if (userId === ref.current.viewingUserId) {
      log('Trigger mutate')
      ref.current.feeds.user.response.mutate()
    }

    // Check to see if the latest feed needs to be updated
    const existingEntries = ref.current.feeds.latest.response.data?.entries.filter(
      (entry) => !entry.isPending
    )
    const newEntries = compiledUserEntries.filter(
      (entry) =>
        !existingEntries.find((existingEntry) => existingEntry.id === entry.id)
    )
    const entriesNeedToBeAddedToLatest = !!newEntries.length

    // If there are not any new entries skip update sequence
    if (!entriesNeedToBeAddedToLatest) {
      log('No new entries')
      return
    }
    log(`New entries: ${newEntries.length}`)

    const myUserId = ref.current.myUserId
    const isSelf = myUserId === userId

    // If following user, update the latest feed
    if (isSelf || isFollowing(user)) {
      // TODO: If this task gets canceled, these user entries may not
      // make it into the main feeds until the next update cycle.
      // Solution: Backdate the timestamp in finally clause?
      addEntries(compiledUserEntries)
    }
  } finally {
    if (signal.aborted) {
      log('Aborted')
    }
    clearToken(ref, getTokenName(userId, resourceName))
    ref.current.feeds.user.setLoadingState(userId, '')
    log('Finished')
  }
})

async function syncUserFeedTask(
  ref: ControlRef,
  userId: string,
  priority: number,
  log: (...args: any[]) => void
): Promise<void> {
  const tokenName = getTokenName(userId, resourceName)
  const token = await handleToken(ref, tokenName)
  try {
    await cafSyncUserFeed(token.signal, ref, userId, priority, log)
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  }
}

export async function syncUserFeed(
  ref: ControlRef,
  userId: string,
  priority: number,
  timeout: number,
  parentLog?: Logger
): Promise<void> {
  const log = parentLog
    ? parentLog.createLogger(resourceName)
    : createLogger(getLogName(userId, resourceName), {
        workflowId: uuid(),
      })

  const user = ref.current.getUser(userId)
  const check = checkIsUpToDate(user, resourceName, timeout)
  if (check.isUpToDate) {
    return null
  }

  log(`${resourceName} resyncing`)
  const task = () => syncUserFeedTask(ref, userId, priority, log)
  await taskQueue.add(task, {
    priority,
    meta: {
      id: userId,
      operation: 'sync',
    },
  })
}
