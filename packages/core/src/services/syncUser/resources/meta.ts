import { JSONResponse } from '@riftdweb/types'
import { TaskQueue } from '@riftdweb/queue'
import { Logger } from '@riftdweb/logger'
import CAF from 'caf'
import { clearToken, handleToken } from '../../../../tokens'
import { checkIsUpToDate } from '../checks'
import { getTokenName } from '../utils'
import { Api } from '../../account'
import { getUser, upsertUser } from '../../users/api'
import { IUserDoc } from '../../../stores/user'

const resourceName = 'meta'
const taskQueue = TaskQueue(`sync/${resourceName}`, {
  poolSize: 50,
  mode: 'dedupe',
})

type SkappsMap = Record<string, boolean>

const cafSyncMeta = CAF(function* (
  signal: any,
  userId: string,
  priority: number,
  log: (...args: any[]) => void
): Generator<
  Promise<JSONResponse<SkappsMap> | IUserDoc | void>,
  SkappsMap,
  any
> {
  log(`${resourceName} resyncing`)

  try {
    const response = yield Api.getJSON<SkappsMap>({
      publicKey: userId,
      domain: 'feed-dac.hns',
      path: 'skapps.json',
      discoverable: true,
      priority,
    })

    let skapps = response.data || {}

    yield upsertUser({
      userId,
      [resourceName]: {
        updatedAt: new Date().getTime(),
        data: {
          skapps,
        },
      },
    })
    return skapps
  } finally {
    if (signal.aborted) {
      log('Aborted')
    }
    clearToken(getTokenName(userId, resourceName))
    log('Finished')
  }
})

async function syncMetaTask(
  userId: string,
  priority: number,
  log: (...args: any[]) => void
): Promise<void> {
  const tokenName = getTokenName(userId, resourceName)
  const token = await handleToken(tokenName)
  try {
    await cafSyncMeta(token.signal, userId, priority, log)
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  }
}

export async function syncMeta(
  userId: string,
  priority: number,
  timeout: number,
  parentLog: Logger
): Promise<void> {
  const log = parentLog.createLogger(resourceName)

  const user = await getUser(userId).exec()
  const check = checkIsUpToDate(user, resourceName, timeout)
  if (check.isUpToDate) {
    return null
  }

  const task = () => syncMetaTask(userId, priority, log)
  await taskQueue.add(task, {
    priority,
    meta: {
      id: userId,
      operation: 'sync',
    },
  })
}
