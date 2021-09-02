import * as CAF from 'caf'
import uniq from 'lodash/uniq'
import { Logger } from '@riftdweb/logger'
import { TaskQueue } from '@riftdweb/queue'
import { ControlRef } from '../../../contexts/skynet/ref'
import { clearToken, handleToken } from '../../tokens'
import { checkIsUpToDate } from '../checks'
import { socialDAC } from '../../../contexts/skynet'
import { apiLimiter } from '../../../contexts/skynet/api'
import { getTokenName } from '..'

const resourceName = 'following'
const taskQueue = TaskQueue(`sync/${resourceName}`, {
  poolSize: 50,
  mode: 'dedupe',
})

const cafSyncFollowing = CAF(function* (
  signal: any,
  ref: ControlRef,
  userId: string,
  priority: number,
  log: (...args: any[]) => void
): Generator<Promise<string[] | void>, string[], any> {
  log(`${resourceName} resyncing`)

  try {
    const task = async () => {
      try {
        return socialDAC.getFollowingForUser(userId)
      } catch (e) {
        return []
      }
    }

    const _followingIds: string[] = yield apiLimiter.add(task, {
      cost: 5,
      priority,
      meta: {
        id: userId,
        name: resourceName,
        operation: 'get',
      },
    })
    const followingIds = uniq(_followingIds)

    yield ref.current.upsertUser({
      userId,
      [resourceName]: {
        updatedAt: new Date().getTime(),
        data: followingIds,
      },
    })

    return followingIds
  } finally {
    if (signal.aborted) {
      log('Aborted')
    }
    clearToken(ref, getTokenName(userId, resourceName))
    log('Finished')
  }
})

async function syncFollowingTask(
  ref: ControlRef,
  userId: string,
  priority: number,
  log: (...args: any[]) => void
): Promise<void> {
  const tokenName = getTokenName(userId, resourceName)
  const token = await handleToken(ref, tokenName)
  try {
    await cafSyncFollowing(token.signal, ref, userId, priority, log)
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  }
}

export async function syncFollowing(
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

  const task = () => syncFollowingTask(ref, userId, priority, log)
  await taskQueue.add(task, {
    priority,
    meta: {
      id: userId,
      operation: 'sync',
    },
  })
}
