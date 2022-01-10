import { createLogger } from '@riftdweb/logger'
import { IUser } from '@riftdweb/types'
import { syncUserFeed } from './resources/feed'
import { getConfig, Level } from './config'
import { buildUser } from '../../stores/user/buildUser'
import { syncProfile } from './resources/profile'
import { syncFollowing } from './resources/following'
import { syncMeta } from './resources/meta'
import { getLogName } from './utils'
import { getUser, upsertUser } from '../users/api'
import { IUserDoc } from '../../stores/user'

type SyncUserParams = {
  workflowId?: string
}

export async function syncUser(
  userId: string,
  level: Level,
  params: SyncUserParams = {}
): Promise<IUserDoc> {
  const { workflowId } = params
  const log = createLogger(getLogName(userId), {
    workflowId: workflowId,
  })

  // await waitFor(() => [ref.current.usersMap.data], {
  //   log,
  //   resourceName: 'users map',
  //   intervalTime: FALSE_START_WAIT_INTERVAL,
  // })

  const existingUser = await getUser(userId).exec()
  const user = existingUser || (await upsertUser(buildUser(userId)))

  const { priority, mode, timeouts } = await getConfig(user, level)

  // Question: set top level loading flag? what if there is multiple calls?

  try {
    const profilePromise = syncProfile(userId, priority, timeouts.profile, log)
    const followingIdsPromise = syncFollowing(
      userId,
      priority,
      timeouts.following,
      log
    )
    const skappsPromise = syncMeta(userId, priority, timeouts.meta, log)
    const feedPromise = syncUserFeed(userId, priority, timeouts.feed, log)

    const promises = [
      profilePromise,
      followingIdsPromise,
      feedPromise,
      skappsPromise,
    ] as Promise<any>[]

    if (mode === 'sync') {
      await Promise.all(promises)
      return getUser(userId).exec()
    }

    return user
  } catch (e) {
    log('syncUser error', e)
  }
}

export { checkIsUserUpToDate } from './checks'
