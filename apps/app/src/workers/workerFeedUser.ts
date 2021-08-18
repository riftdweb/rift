import * as CAF from 'caf'
import { v4 as uuid } from 'uuid'
import { JSONResponse } from 'skynet-js'
import { createLogger } from '../shared/logger'
import { TaskQueue } from '../shared/taskQueue'
import { ControlRef } from '../contexts/skynet/ref'
import { isUpToDate } from '../contexts/users'
import { cacheUserEntries, compileUserEntries } from './workerApi'
import { clearToken, handleToken } from './tokens'
import { Entry, EntryFeed, WorkerParams } from '@riftdweb/types'
import { feedLatestAdd } from './workerFeedLatest'

const taskQueue = TaskQueue('feed/user', {
  poolSize: 5,
})

const cafFeedUserUpdate = CAF(function* feedUserUpdate(
  signal: any,
  ref: ControlRef,
  userId: string,
  params: WorkerParams
): Generator<Promise<EntryFeed | Entry[] | JSONResponse | void>, any, any> {
  const shortUserId = userId.slice(0, 5)
  const log = createLogger(`feed/user/${shortUserId}/update`, {
    workflowId: params.workflowId,
  })

  try {
    log('Running')
    ref.current.feeds.user.setLoadingState(userId, 'Compiling feed')

    let user = ref.current.getUser(userId)
    if (
      !params.force &&
      isUpToDate(user, 'feed', {
        verbose: true,
        log,
      })
    ) {
      return
    }

    log('Compiling entries')
    let compiledUserEntries: Entry[] = yield compileUserEntries(userId, params)

    log('Caching entries')
    ref.current.feeds.user.setLoadingState(userId, 'Caching feed')
    yield cacheUserEntries(ref, userId, compiledUserEntries, params)

    log('Updating updatedAt and count')
    user = ref.current.getUser(userId)
    ref.current.upsertUser({
      ...user,
      feed: {
        updatedAt: new Date().getTime(),
        data: {
          count: compiledUserEntries.length,
        },
      },
    })

    log('Maybe mutate')
    ref.current.feeds.user.setLoadingState(userId, 'Fetching feed')
    const viewingUserId = ref.current.viewingUserId
    if (userId === viewingUserId) {
      log('Trigger mutate')
      yield ref.current.feeds.user.response.mutate()
    }

    // Check to see if the latest feed needs to be updated
    const existingEntries = ref.current.feeds.latest.response.data?.entries
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
    const isFollowingUser = !!ref.current.followingUserIds.data?.find(
      (followingUserId) => followingUserId === userId
    )

    // If following user, update the latest feed
    if (isSelf || isFollowingUser) {
      // TODO: Running this function is not captured in the user feed updatedAt timestamp.
      // If the user worker gets canceled, this may lead to user entries that do not
      // make it into the main feeds until the next update cycle.
      // Solution: Backdate the timestamp in finally clause?
      feedLatestAdd(compiledUserEntries)
    }

    log('Returning')
  } finally {
    log('Finally')
    if (signal.aborted) {
      log('Aborted')
    }
    clearToken(ref, `feedUserUpdate/${userId}`)
    ref.current.feeds.user.setLoadingState(userId, '')
  }
})

export async function feedUserUpdate(
  ref: ControlRef,
  userId: string,
  params: WorkerParams = {}
): Promise<any> {
  const workflowId = uuid()
  const shortUserId = userId.slice(0, 5)
  const log = createLogger(`feed/user/${shortUserId}/update`, {
    workflowId,
  })
  const token = await handleToken(ref, `feedUserUpdate/${userId}`)
  try {
    await cafFeedUserUpdate(token.signal, ref, userId, {
      ...params,
      workflowId,
    })
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  }
}

export async function workerFeedUserUpdate(
  ref: ControlRef,
  userId: string,
  params: WorkerParams = {}
): Promise<any> {
  const task = () => feedUserUpdate(ref, userId, params)
  await taskQueue.add(task, {
    name: `user/feed: update ${userId}`,
    priority: params.priority,
  })
}
