import * as CAF from 'caf'
import { createLogger } from '../shared/logger'
import { ControlRef } from '../contexts/skynet/ref'
import { fetchAllEntries } from './workerApi'
import { workerFeedUserUpdate } from './workerFeedUser'
import { EntryFeed, WorkerParams } from '@riftdweb/types'
import { clearToken, handleToken } from './tokens'
import { wait, waitFor } from '../shared/wait'
import { v4 as uuid } from 'uuid'

const SCHEDULE_INTERVAL_INDEXER = 1000 * 60 * 5
const FALSE_START_WAIT_INTERVAL = 1000 * 2

const cafFeedIndexer = CAF(function* feedIndexer(
  signal: any,
  ref: ControlRef,
  params: WorkerParams
): Generator<Promise<EntryFeed | string[]>, any, any> {
  const log = createLogger('feedIndexer', {
    workflowId: params.workflowId,
  })
  let userWorkers = []
  try {
    log('Running')
    const myUserId = ref.current.myUserId

    log('Checking feed status')
    ref.current.feeds.latest.setLoadingState('Checking feed status')
    let allEntriesFeed = yield fetchAllEntries(ref, {
      priority: params.priority,
    })

    log('Fetching following')
    let followingUserIds = ref.current.followingUserIds.data || []

    // If no entries exist yet and following at least 1 user
    // Probably a new user, so render onboarding message in feed UI
    if (!allEntriesFeed.entries.length && followingUserIds.length) {
      ref.current.feeds.top.setLoadingState('Building your feed')
      ref.current.feeds.latest.setLoadingState('Building your feed')
    } else {
      ref.current.feeds.latest.setLoadingState('')
    }

    // // If no entries exist yet and not followings anyone
    // if (!allEntriesFeed.entries.length && !followingUserIds.length) {
    //   ref.current.setNonIdealState('Follow some users to get started!')
    //   return
    // }

    if (myUserId) {
      followingUserIds = [myUserId, ...followingUserIds]
    }

    userWorkers = followingUserIds.map((userId) =>
      workerFeedUserUpdate(ref, userId)
    )

    log('Returning')
    return
  } finally {
    log('Finally')
    if (signal.aborted) {
      log('Aborted')
    }

    yield Promise.all(userWorkers)
    // Only clear loading states if no downstream worker has set a new state
    // This will only occur if no followings have any data
    if (ref.current.feeds.latest.loadingState === 'Building your feed') {
      ref.current.feeds.latest.setLoadingState('')
    }
    if (ref.current.feeds.top.loadingState === 'Building your feed') {
      ref.current.feeds.top.setLoadingState('')
    }
  }
})

export async function workerFeedIndexer(
  ref: ControlRef,
  params: WorkerParams = {}
): Promise<any> {
  const workflowId = uuid()
  const log = createLogger('feedIndexer', {
    workflowId,
  })
  const token = await handleToken(ref, 'feedIndexer')
  try {
    await cafFeedIndexer(token.signal, ref, {
      ...params,
      workflowId,
    })
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  } finally {
    clearToken(ref, 'feedIndexer')
  }
}

const logScheduler = createLogger('feedIndexer/scheduler')

async function maybeRunFeedIndexer(ref: ControlRef): Promise<any> {
  await waitFor(() => [ref.current.followingUserIdsHasFetched], {
    log: logScheduler,
    resourceName: 'follower list',
    intervalTime: FALSE_START_WAIT_INTERVAL,
  })

  // If indexer is already running skip
  if (ref.current.tokens.feedIndexer) {
    logScheduler(`Indexer already running, skipping`)
  } else {
    logScheduler(`Indexer starting`)
    workerFeedIndexer(ref)
  }
}

let interval = null

export async function scheduleFeedIndexer(ref: ControlRef): Promise<any> {
  logScheduler('Starting scheduler')

  // Give the page render requests a few seconds to complete
  await wait(3000)

  maybeRunFeedIndexer(ref)

  clearInterval(interval)
  interval = setInterval(() => {
    maybeRunFeedIndexer(ref)
  }, SCHEDULE_INTERVAL_INDEXER)
}
