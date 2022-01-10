import CAF from 'caf'
import uniq from 'lodash/uniq'
import { Logger } from '@riftdweb/logger'
import { TaskQueue } from '@riftdweb/queue'
import { clearToken, handleToken } from '../../../../tokens'
import { checkIsUpToDate } from '../checks'
import { socialDAC } from '../../../../../contexts/skynet'
import { apiLimiter } from '../../account/api'
import { getTokenName } from '../utils'
import { getUser, upsertUser } from '../../users/api'
import { IUserDoc } from '../../../stores/user'

const resourceName = 'following'
const taskQueue = TaskQueue(`sync/${resourceName}`, {
  poolSize: 50,
  mode: 'dedupe',
})

const cafSyncFollowing = CAF(function* (
  signal: any,
  userId: string,
  priority: number,
  log: (...args: any[]) => void
): Generator<Promise<string[] | IUserDoc | void>, string[], any> {
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

    yield upsertUser({
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
    clearToken(getTokenName(userId, resourceName))
    log('Finished')
  }
})

async function syncFollowingTask(
  userId: string,
  priority: number,
  log: (...args: any[]) => void
): Promise<void> {
  const tokenName = getTokenName(userId, resourceName)
  const token = await handleToken(tokenName)
  try {
    await cafSyncFollowing(token.signal, userId, priority, log)
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  }
}

export async function syncFollowing(
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

  const task = () => syncFollowingTask(userId, priority, log)
  await taskQueue.add(task, {
    priority,
    meta: {
      id: userId,
      operation: 'sync',
    },
  })
}
