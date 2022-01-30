import { createLogger } from '@riftdweb/logger'
import { TaskQueue } from '@riftdweb/queue'
import { uniq } from 'lodash'
import { buildUser } from '../../stores/user/buildUser'
import { recomputeFollowers } from './utils'
import { getAccount, socialDAC } from '../account'
import { apiLimiter } from '../account/api'
import { addNewUserIds, getUser, upsertUser } from './api'
import { syncUser } from '../syncUser'
import { syncUserFeed } from '../syncUser/resources/feed'
import { db } from '../../stores'

export const log = createLogger('rx/users')

const taskQueue = TaskQueue('users')

export async function initUsersService() {
  const amount: number = await db.user.count()
  log('User count', amount)
}

export async function initUsers() {
  const { myUserId, isReady, appDomain } = await getAccount()

  // const data = await fetchUsersMap(ref, {
  //   priority: 4,
  // })

  // 1. Check for existing users db
  // 2. if none, initialize from seed db
}

export async function initUser() {
  const { myUserId } = await getAccount()
  const task = async () => {
    // Sync myUser
    const user = await syncUser(myUserId, 'read')
    // Add following user ids in case they do not exist yet (first time user)
    await addNewUserIds(user.following.data)
    // Recompute followers right away so that relationships work right away
    // before all users are fully synced
    await recomputeFollowers()
  }
  return apiLimiter.add(task, {
    priority: 4,
    meta: {
      id: myUserId,
      name: 'following',
      operation: 'get',
    },
  })
}

// TODO: Add offline update queue, task queue feature?
export async function handleFollow(userId: string) {
  const { myUserId } = await getAccount()

  if (!myUserId) {
    return
  }

  log('Following user', userId)
  const user = (await getUser(userId).exec()) || buildUser(userId)

  // Optimistically we are now their follower
  await upsertUser({
    userId,
    followers: {
      ...user.followers,
      data: uniq([...user.followers.data, myUserId]),
    },
  })

  // Optimistically we are now following them
  const myUser = await getUser(myUserId).exec()
  await upsertUser({
    userId: myUserId,
    following: {
      data: uniq([...myUser.following.data, userId]),
      // Update time so that upcoming syncUser calls do not rollback optimistic data
      updatedAt: new Date().getTime(),
    },
  })

  await recomputeFollowers()

  // changeSuggestionsKey()

  try {
    const follow = async () => {
      try {
        await socialDAC.follow(userId)
      } catch (e) {
        log('Failed to follow', e)
      }
    }

    await taskQueue.add(
      async () => {
        await apiLimiter.add(follow, {
          priority: 4,
          meta: {
            id: userId,
            operation: 'follow',
          },
        })
      },
      {
        meta: {
          id: userId,
          operation: 'follow',
        },
      }
    )

    // Trigger update user
    syncUserFeed(userId, 4, 0)
  } catch (e) {
    log(`Error following user ${userId.slice(0, 5)}`, e)
  }
}

export async function handleUnfollow(userId: string) {
  const { myUserId } = await getAccount()

  if (!myUserId) {
    return
  }

  log('Unfollowing user', userId)
  const user = (await getUser(userId).exec()) || buildUser(userId)

  // Optimistically we are now not their follower
  await upsertUser({
    userId,
    followers: {
      ...user.followers,
      data: user.followers.data.filter((id) => id !== myUserId),
    },
  })

  // Optimistically we are now not following them
  const myUser = await getUser(myUserId).exec()
  await upsertUser({
    userId: myUserId,
    following: {
      data: myUser.following.data.filter((id) => id !== userId),
      // Update time so that upcoming syncUser calls do not rollback optimistic data
      updatedAt: new Date().getTime(),
    },
  })

  await recomputeFollowers()

  try {
    const unfollow = async () => {
      try {
        await socialDAC.unfollow(userId)
      } catch (e) {
        log('Failed to unfollow', e)
      }
    }

    await taskQueue.add(
      async () => {
        await apiLimiter.add(unfollow, {
          priority: 4,
          meta: {
            id: userId,
            operation: 'unfollow',
          },
        })
      },
      {
        meta: {
          id: userId,
          operation: 'unfollow',
        },
      }
    )
  } catch (e) {
    log(`Error unfollowing user ${userId.slice(0, 5)}`, e)
  }
}
