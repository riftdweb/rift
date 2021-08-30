import { JSONResponse } from '@riftdweb/types'
import * as CAF from 'caf'
import { ControlRef } from '../../../contexts/skynet/ref'
import { Logger } from '../../../shared/logger'
import { clearToken, handleToken } from '../../tokens'
import { checkIsUpToDate } from '../checks'
import { TaskQueue } from '../../../shared/taskQueue'
import { getTokenName } from '..'

const resourceName = 'meta'
const taskQueue = TaskQueue(`sync/${resourceName}`, {
  poolSize: 50,
  mode: 'dedupe',
})

type SkappsMap = Record<string, boolean>

const cafSyncMeta = CAF(function* (
  signal: any,
  ref: ControlRef,
  userId: string,
  priority: number,
  log: (...args: any[]) => void
): Generator<Promise<JSONResponse<SkappsMap> | void>, SkappsMap, any> {
  log(`${resourceName} resyncing`)

  try {
    const response = yield ref.current.Api.getJSON<SkappsMap>({
      publicKey: userId,
      domain: 'feed-dac.hns',
      path: 'skapps.json',
      discoverable: true,
      priority,
    })

    let skapps = response.data || {}

    yield ref.current.upsertUser({
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
    clearToken(ref, getTokenName(userId, resourceName))
    log('Finished')
  }
})

async function syncMetaTask(
  ref: ControlRef,
  userId: string,
  priority: number,
  log: (...args: any[]) => void
): Promise<void> {
  const tokenName = getTokenName(userId, resourceName)
  const token = await handleToken(ref, tokenName)
  try {
    await cafSyncMeta(token.signal, ref, userId, priority, log)
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  }
}

export async function syncMeta(
  ref: ControlRef,
  userId: string,
  priority: number,
  timeout: number,
  parentLog: Logger
): Promise<void> {
  const log = parentLog.createLogger(resourceName)

  const user = ref.current.getUser(userId)
  const check = checkIsUpToDate(user, resourceName, timeout)
  if (check.isUpToDate) {
    return null
  }

  const task = () => syncMetaTask(ref, userId, priority, log)
  await taskQueue.add(task, {
    priority,
    meta: {
      id: userId,
      operation: 'sync',
    },
  })
}
