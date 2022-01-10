import { JSONResponse } from '@riftdweb/types'
import { Logger } from '@riftdweb/logger'
import { TaskQueue } from '@riftdweb/queue'
import CAF from 'caf'
import {
  IProfileIndex,
  IUserProfile,
} from '@skynethub/userprofile-library/dist/types'
import { clearToken, handleToken } from '../../../../tokens'
import { checkIsUpToDate } from '../checks'
import { getTokenName } from '../utils'
import { getUser, upsertUser } from '../../users/api'
import { IUserDoc } from '../../../stores/user'
import { Api } from '../../account'

const resourceName = 'profile'
const taskQueue = TaskQueue(`sync/${resourceName}`, {
  poolSize: 50,
  mode: 'dedupe',
})

const cafSyncProfile = CAF(function* (
  signal: any,
  userId: string,
  priority: number,
  log: (...args: any[]) => void
): Generator<
  Promise<JSONResponse<IProfileIndex> | IUserDoc | void>,
  IUserProfile,
  any
> {
  log(`${resourceName} resyncing`)

  try {
    const response: JSONResponse<IProfileIndex> = yield Api.getJSON<IProfileIndex>(
      {
        publicKey: userId,
        domain: 'profile-dac.hns',
        path: 'profileIndex.json',
        discoverable: true,
        priority,
      }
    )

    let profile = response.data?.profile || {
      version: 1,
      username: '',
    }

    yield upsertUser({
      userId,
      username: profile.username,
      [resourceName]: {
        updatedAt: new Date().getTime(),
        data: profile,
      },
    })

    return profile
  } finally {
    if (signal.aborted) {
      log('Aborted')
    }
    clearToken(getTokenName(userId, resourceName))
    log('Finished')
  }
})

async function syncProfileTask(
  userId: string,
  priority: number,
  log: (...args: any[]) => void
): Promise<void> {
  const tokenName = getTokenName(userId, resourceName)
  const token = await handleToken(tokenName)
  try {
    await cafSyncProfile(token.signal, userId, priority, log)
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  }
}

export async function syncProfile(
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

  const task = () => syncProfileTask(userId, priority, log)
  await taskQueue.add(task, {
    priority,
    meta: {
      id: userId,
      operation: 'sync',
    },
  })
}
