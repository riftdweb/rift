import { JSONResponse } from '@riftdweb/types'
import { Logger } from '@riftdweb/logger'
import { TaskQueue } from '@riftdweb/queue'
import * as CAF from 'caf'
import {
  IProfileIndex,
  IUserProfile,
} from '@skynethub/userprofile-library/dist/types'
import { ControlRef } from '../../../contexts/skynet/ref'
import { clearToken, handleToken } from '../../tokens'
import { checkIsUpToDate } from '../checks'
import { getTokenName } from '..'

const resourceName = 'profile'
const taskQueue = TaskQueue(`sync/${resourceName}`, {
  poolSize: 50,
  mode: 'dedupe',
})

const cafSyncProfile = CAF(function* (
  signal: any,
  ref: ControlRef,
  userId: string,
  priority: number,
  log: (...args: any[]) => void
): Generator<Promise<JSONResponse<IProfileIndex> | void>, IUserProfile, any> {
  log(`${resourceName} resyncing`)

  try {
    const response: JSONResponse<IProfileIndex> = yield ref.current.Api.getJSON<IProfileIndex>(
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

    yield ref.current.upsertUser({
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
    clearToken(ref, getTokenName(userId, resourceName))
    log('Finished')
  }
})

async function syncProfileTask(
  ref: ControlRef,
  userId: string,
  priority: number,
  log: (...args: any[]) => void
): Promise<void> {
  const tokenName = getTokenName(userId, resourceName)
  const token = await handleToken(ref, tokenName)
  try {
    await cafSyncProfile(token.signal, ref, userId, priority, log)
  } catch (e) {
    if (e) {
      log('Error', e)
    }
  }
}

export async function syncProfile(
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

  const task = () => syncProfileTask(ref, userId, priority, log)
  await taskQueue.add(task, {
    priority,
    meta: {
      id: userId,
      operation: 'sync',
    },
  })
}
