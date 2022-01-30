import { createLogger, Logger } from '@riftdweb/logger'
import { Entry } from '@riftdweb/types'
import { TaskQueue } from '@riftdweb/queue'
import CAF from 'caf'
import { v4 as uuid } from 'uuid'
import { getUser, upsertUser } from '../../users/api'
import { compileUserEntries } from '../../serviceApi'
import { clearToken, handleToken } from '../../tokens'
import { checkIsUpToDate } from '../checks'
import { getLogName, getTokenName } from '../utils'
import { IUserDoc } from '../../../stores/user'
import { IEntryDoc } from '../../../stores/entry'
import { RxStorageBulkWriteError } from 'rxdb/dist/types/types'
import { db, state } from '../../../stores'

const resourceName = 'feed'
// Keep pool a little bigger than the indexer batch size
// so higher priorty tasks can start right away.
const taskQueue = TaskQueue(`sync/${resourceName}`, {
  poolSize: 10,
  mode: 'dedupe',
})

const cafSyncUserFeed = CAF(function* (
  signal: any,
  userId: string,
  priority: number,
  log: (...args: any[]) => void
): Generator<
  Promise<
    | IUserDoc
    | Entry[]
    | {
        success: IEntryDoc[]
        error: RxStorageBulkWriteError<Entry>[]
      }
    | void
  >,
  any,
  any
> {
  const params = {
    priority,
  }
  try {
    log('Running')
    state.loaders.atomicUpsert({
      id: userId,
      isLoading: true,
    })

    // TODO: Add revision check

    log('Compiling entries')
    let compiledUserEntries: Entry[] = yield compileUserEntries(userId, params)

    // Add directly to feed db
    yield db.entry.bulkInsert(compiledUserEntries)

    // Update metadata
    yield upsertUser({
      userId,
      feed: {
        updatedAt: new Date().getTime(),
        data: {
          count: compiledUserEntries.length,
        },
      },
    })
  } finally {
    if (signal.aborted) {
      log('Aborted')
    }
    clearToken(getTokenName(userId, resourceName))
    state.loaders.atomicUpsert({
      id: userId,
      isLoading: false,
    })
    log('Finished')
  }
})

async function syncUserFeedTask(
  userId: string,
  priority: number,
  log: (...args: any[]) => void
): Promise<void> {
  const tokenName = getTokenName(userId, resourceName)
  const token = await handleToken(tokenName)
  try {
    await cafSyncUserFeed(token.signal, userId, priority, log)
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  }
}

export async function syncUserFeed(
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

  const user = await getUser(userId).exec()
  const check = checkIsUpToDate(user, resourceName, timeout)
  if (check.isUpToDate) {
    return null
  }

  log(`${resourceName} resyncing`)
  const task = () => syncUserFeedTask(userId, priority, log)
  await taskQueue.add(task, {
    priority,
    meta: {
      id: userId,
      operation: 'sync',
    },
  })
}
