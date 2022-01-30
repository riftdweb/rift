import { uniq } from 'lodash'
import { RxQuery } from 'rxdb'
import { db } from '../../stores'
import { suggestionList } from './suggestionList'
import { buildUser } from '../../stores/user/buildUser'
import { IUser, IUserDoc } from '../../stores/user'
import { getAccount, getAccount$ } from '../account'
import { checkIsUserUpToDate } from '../syncUser'
import { isFollowing, sortByRelationship } from './utils'
import { combineLatest, from, map, Observable, pipe } from 'rxjs'

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

export async function getUsers(userIds: string[] = []) {
  const users = await db.user.findByIds(userIds)
  return [...users.values()]
}

export function getUsers$(userIds: string[] = []) {
  return db.user.findByIds$(userIds).pipe(map((users) => [...users.values()]))
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

export function getPending() {
  return Promise.all([getAccount(), getUsers()]).then(([account, users]) =>
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

export function getPending$(): Observable<IUserDoc[]> {
  return combineLatest([getAccount$(), getUsers$()]).pipe(
    map(([account, users]) =>
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
  )
}

export function getSuggestions$() {
  return combineLatest([getAccount$(), getUsers$()]).pipe(
    map(([account, users]) => {
      let suggestions = suggestionList
        .map((id) => buildUser(id))
        .filter(({ userId }) => {
          const foundUser = users.find((u) => u.userId === userId)
          return !foundUser || !isFollowing(foundUser)
        })

      if (suggestions.length < 5) {
        const followers = users.filter(
          (user) => user.relationship.data === 'follower'
        )
        suggestions = suggestions.concat(followers.slice(0, 5))
      }

      if (suggestions.length < 5) {
        const other = users.filter((user) => user.relationship.data === 'none')
        suggestions = suggestions.concat(other.slice(0, 5 - suggestions.length))
      }

      return uniq(suggestions).filter((sug) => sug.userId !== account.myUserId)
    })
  )
}

export function getIndexedUsers$() {
  return getUsers$().pipe(
    map((users) =>
      users
        .filter((user) => !!user && !!user.updatedAt)
        .sort(sortByRelationship)
    )
  )
}

export function getUserCounts$() {
  return combineLatest([getUsers$(), getIndexedUsers$(), getPending$()]).pipe(
    map(([users, indexed, pending]) => {
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
    })
  )
}
