import * as CAF from 'caf'
import { createLogger } from '../../shared/logger'
import { ControlRef } from '../../contexts/skynet/ref'
import { EntryFeed, UsersMap, WorkerParams } from '@riftdweb/types'
import { clearToken, handleToken } from '../tokens'
import { wait, waitFor } from '../../shared/wait'
import { syncUser } from '../user'
import { recomputeFollowers } from './utils'

const FALSE_START_WAIT_INTERVAL = 1000 * 2
const BATCH_SIZE = 5

const tokenName = 'userIndexer'
export const log = createLogger('userIndexer')

const cafUsersIndexer = CAF(function* (
  signal: any,
  ref: ControlRef,
  params: WorkerParams
): Generator<Promise<EntryFeed | string[] | void | UsersMap>, any, any> {
  let tasks = []
  try {
    log('Running')

    while (true) {
      const userIds = ref.current.getUsersPendingUpdate()
      if (!userIds.length) {
        yield wait(5_000)
        continue
      }
      log(`Users pending updates: ${userIds.length}`)

      const batch = userIds.splice(0, BATCH_SIZE)
      log('Batch', batch)

      tasks = batch.map((userId) =>
        syncUser(ref, userId, 'index', {
          workflowId: params.workflowId,
        })
      )

      yield Promise.all(tasks)
      log('Batch complete')

      // Index the discovered following
      const updatedUsers = batch.map(ref.current.getUser)
      log(updatedUsers)
      const userIdsToAdd = []
      updatedUsers.forEach((newItem) => {
        if (newItem) {
          userIdsToAdd.push(...newItem.following.data)
        }
      })

      ref.current.addNewUserIds(userIdsToAdd)

      // Recompute followers
      yield recomputeFollowers(ref)
    }
  } finally {
    log('Exiting, finally')
    if (signal.aborted) {
      log('Aborted')
    }
  }
})

async function usersIndexer(
  ref: ControlRef,
  params: WorkerParams = {}
): Promise<any> {
  const token = await handleToken(ref, tokenName)
  try {
    await cafUsersIndexer(token.signal, ref, params)
  } catch (e) {
    log('Error', e)
  } finally {
    clearToken(ref, tokenName)
  }
}

const logScheduler = createLogger('userIndexer/schedule')

async function maybeRunUsersIndexer(ref: ControlRef): Promise<any> {
  await waitFor(() => [ref.current.isInitUsersComplete], {
    log: logScheduler,
    resourceName: 'init users',
    intervalTime: FALSE_START_WAIT_INTERVAL,
  })

  // If indexer is already running skip
  if (ref.current.tokens[tokenName]) {
    logScheduler(`Indexer already running, skipping`)
  } else {
    logScheduler(`Indexer starting`)
    usersIndexer(ref)
  }
}

export async function scheduleUsersIndexer(ref: ControlRef): Promise<any> {
  logScheduler('Starting scheduler')

  // Give the page render requests a few seconds to complete
  await wait(3000)

  maybeRunUsersIndexer(ref)
}
