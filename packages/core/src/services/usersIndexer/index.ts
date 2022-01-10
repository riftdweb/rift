import CAF from 'caf'
import { createLogger } from '@riftdweb/logger'
import { UsersMap, TaskParams } from '@riftdweb/types'
import { clearToken, getToken, handleToken } from '../../../tokens'
import { wait } from '../../../../shared/wait'
import { recomputeFollowers } from '../users/utils'
import { addNewUserIds, getPending } from '../users/api'
import { IUserDoc } from '../../stores/user'
import { syncUser } from '../syncUser'

// const FALSE_START_WAIT_INTERVAL = 1000 * 2
const BATCH_SIZE = 5

const tokenName = 'userIndexer'
export const log = createLogger('userIndexer')

const cafUsersIndexer = CAF(function* (
  signal: any,
  params: TaskParams
): Generator<Promise<IUserDoc[] | string[] | void | UsersMap>, any, any> {
  let tasks: Promise<IUserDoc>[] = []
  try {
    log('Running')

    while (true) {
      const pendingUsers: IUserDoc[] = yield getPending()
      if (!pendingUsers.length) {
        yield wait(5_000)
        continue
      }
      log(`Users pending updates: ${pendingUsers.length}`)

      const batch = pendingUsers.splice(0, BATCH_SIZE)
      log('Batch', batch)

      tasks = batch.map((user) =>
        syncUser(user.userId, 'index', {
          workflowId: params.workflowId,
        })
      )

      const users = yield Promise.all(tasks)
      log('Batch complete')

      const userIdsToAdd = []

      users.forEach((newItem) => {
        if (newItem) {
          userIdsToAdd.push(...newItem.following.data)
        }
      })

      addNewUserIds(userIdsToAdd)

      // Recompute followers
      yield recomputeFollowers()
    }
  } finally {
    log('Exiting, finally')
    if (signal.aborted) {
      log('Aborted')
    }
  }
})

async function usersIndexer(params: TaskParams = {}): Promise<any> {
  const token = await handleToken(tokenName)
  try {
    await cafUsersIndexer(token.signal, params)
  } catch (e) {
    log('Error', e)
  } finally {
    clearToken(tokenName)
  }
}

const logScheduler = createLogger('userIndexer/schedule')

async function maybeRunUsersIndexer(): Promise<any> {
  // await waitFor(() => [ref.current.isInitUsersComplete], {
  //   log: logScheduler,
  //   resourceName: 'init users',
  //   intervalTime: FALSE_START_WAIT_INTERVAL,
  // })

  // If indexer is already running skip
  if (getToken(tokenName)) {
    logScheduler(`Indexer already running, skipping`)
  } else {
    logScheduler(`Indexer starting`)
    usersIndexer()
  }
}

export async function scheduleUsersIndexer(): Promise<any> {
  logScheduler('Starting scheduler')

  // Give the page render requests a few seconds to complete
  await wait(3000)

  maybeRunUsersIndexer()
}
