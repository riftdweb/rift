import { uniq } from 'lodash'
import { RxQuery } from 'rxdb'
import { db } from '../../stores'
import { suggestionList } from './suggestionList'
import { buildUser } from '../../stores/user/buildUser'
import { IUser, IUserDoc } from '../../stores/user'
import { getAccount } from '../account'
import { checkIsUserUpToDate } from '../syncUser'
import { isFollowing, sortByRelationship } from './utils'
import { from, map, pipe } from 'rxjs'

export function getUser(userId: string): RxQuery<IUser, IUserDoc> {
  return db.user.findOne(userId)
}

export async function upsertUser(user: { userId: string } & Partial<IUser>) {
  const baseUser = buildUser(user.userId)
  const existingUser = await getUser(user.userId).exec()
  const nextUser = {
    ...baseUser,
    ...existingUser,
    ...user,
    updatedAt: new Date().getTime(),
  }
  return db.user.atomicUpsert(nextUser)
}

export async function upsertUsers(users: IUser[]) {
  return users.map(upsertUser)
}

export async function addNewUserIds(userIds: string[]) {
  return db.user.bulkInsert(userIds.map(buildUser))
}

export async function removeUserIds(userIds: string[]) {
  return db.user.bulkRemove(userIds)
}

export function getUsers(): RxQuery<IUser, IUserDoc[]> {
  return db.user.find()
}

export function getFriends(): RxQuery<IUser, IUserDoc[]> {
  return db.user.find({
    selector: {
      eq: {
        relationship: {
          data: 'friend',
        },
      },
    },
  })
}

export function getFollowers(): RxQuery<IUser, IUserDoc[]> {
  return db.user.find({
    selector: {
      in: {
        relationship: {
          data: ['friend', 'follower'],
        },
      },
    },
  })
}

export function getFollowing(): RxQuery<IUser, IUserDoc[]> {
  return db.user.find({
    selector: {
      in: {
        relationship: {
          data: ['friend', 'following'],
        },
      },
    },
  })
}

export async function getPending(): Promise<IUserDoc[]> {
  const account = await getAccount().exec()
  const users = await getUsers().exec()
  return (
    users
      // Filter out any thing that is fully up to date
      .filter((user) => {
        const check = checkIsUserUpToDate(account, user, {
          level: 'index',
        })
        return !check.isUpToDate
      })
      // Filter out any thing that is fully up to date
      .sort((a, b) => sortByRelationship(a, b))
  )
}

export async function getSuggestions() {
  const account = await getAccount().exec()
  const users = await getUsers().exec()

  let suggestionIds = suggestionList.filter((userId) => {
    const foundUser = users.find((u) => u.userId === userId)
    return !foundUser || !isFollowing(foundUser)
  })

  if (suggestionIds.length < 5) {
    const followers = users.filter(
      (user) => user.relationship.data === 'follower'
    )
    suggestionIds = suggestionIds.concat(
      followers.slice(0, 5).map((user) => user.userId)
    )
  }

  if (suggestionIds.length < 5) {
    const other = users.filter((user) => user.relationship.data === 'none')
    suggestionIds = suggestionIds.concat(
      other.slice(0, 5 - suggestionIds.length).map((user) => user.userId)
    )
  }

  const userIds = uniq(suggestionIds).filter(
    (suggestionUserId) => suggestionUserId !== account.myUserId
  )

  return userIds
}

export async function getIndexedUsers() {
  const users = await getUsers().exec()
  return users
    .filter((user) => !!user && !!user.updatedAt)
    .sort(sortByRelationship)
}

export function getIndexedUsers$() {
  return getUsers().$.pipe(
    map((users) =>
      users
        .filter((user) => !!user && !!user.updatedAt)
        .sort(sortByRelationship)
    )
  )
}

export async function getUserCounts() {
  const users = await getUsers().exec()
  const indexed = await getIndexedUsers()
  const pending = await getPending()
  const discoveredUsersCount = users.length
  const indexedUsersCount = indexed.length
  const pendingIndexingUsersCount = pending.length
  const neverBeenIndexed = discoveredUsersCount - indexedUsersCount

  return {
    discovered: discoveredUsersCount,
    hasBeenIndexed: indexedUsersCount,
    neverBeenIndexed: discoveredUsersCount - indexedUsersCount,
    pendingReindexing: pendingIndexingUsersCount - neverBeenIndexed,
    pendingIndexing: pendingIndexingUsersCount,
  }
}
