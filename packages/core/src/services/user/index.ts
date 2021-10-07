import { createLogger } from '@riftdweb/logger'
import { IUser } from '@riftdweb/types'
import { ControlRef } from '../../contexts/skynet/ref'
import { syncUserFeed } from './resources/feed'
import { getConfig, Level } from './config'
import { buildUser } from './buildUser'
import { waitFor } from '../../shared/wait'
import { syncProfile } from './resources/profile'
import { syncFollowing } from './resources/following'
import { syncMeta } from './resources/meta'
import { getLogName } from './utils'

const FALSE_START_WAIT_INTERVAL = 1_000

type SyncUserParams = {
  workflowId?: string
}

export async function syncUser(
  ref: ControlRef,
  userId: string,
  level: Level,
  params: SyncUserParams = {}
): Promise<IUser> {
  const { workflowId } = params
  const log = createLogger(getLogName(userId), {
    workflowId: workflowId,
  })

  await waitFor(() => [ref.current.usersMap.data], {
    log,
    resourceName: 'users map',
    intervalTime: FALSE_START_WAIT_INTERVAL,
  })

  const existingUser = ref.current.getUser(userId)
  const user = existingUser || buildUser(userId)

  const { priority, mode, timeouts } = getConfig(ref, user, level)

  // Question: set top level loading flag? what if there is multiple calls?

  try {
    const profilePromise = syncProfile(
      ref,
      userId,
      priority,
      timeouts.profile,
      log
    )
    const followingIdsPromise = syncFollowing(
      ref,
      userId,
      priority,
      timeouts.following,
      log
    )
    const skappsPromise = syncMeta(ref, userId, priority, timeouts.meta, log)
    const feedPromise = syncUserFeed(ref, userId, priority, timeouts.feed, log)

    const promises = [
      profilePromise,
      followingIdsPromise,
      feedPromise,
      skappsPromise,
    ] as Promise<any>[]

    if (mode === 'sync') {
      await Promise.all(promises)
      return ref.current.getUser(userId)
    }

    return user
  } catch (e) {
    log('syncUser error', e)
  }
}

export { checkIsUserUpToDate } from './checks'
