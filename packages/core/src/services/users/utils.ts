import { IUser, RelationshipType } from '@riftdweb/types'
import { uniq } from 'lodash'
import { log } from '.'
import { getAccount } from '../account'
import { getUser, getUsers } from './api'

export function isFollowing(user?: IUser) {
  return !!user && ['friend', 'following'].includes(user.relationship.data)
}

export function isFollower(user?: IUser) {
  return !!user && ['friend', 'follower'].includes(user.relationship.data)
}

export function isFriend(user?: IUser) {
  return !!user && user.relationship.data === 'friend'
}

export function sortByRelationship(a?: IUser, b?: IUser): 1 | -1 {
  if (!a) {
    return 1
  }
  if (!b) {
    return -1
  }
  const isFriendUserA = isFriend(a)
  const isFriendUserB = isFriend(b)
  const isFollowingUserA = isFollowing(a)
  const isFollowerUserA = isFollower(a)
  const isFollowingUserB = isFollowing(b)
  // const isFollowerUserB = isFollower(b)
  return isFriendUserA
    ? -1
    : isFriendUserB
    ? 1
    : isFollowingUserA
    ? -1
    : isFollowingUserB
    ? 1
    : isFollowerUserA
    ? -1
    : 1
}

export function getRelationship(
  myUserId: string,
  user: IUser
): RelationshipType {
  const followsMe = user.following.data.includes(myUserId)
  const iFollow = user.followers.data.includes(myUserId)

  let relationship: RelationshipType = 'none'

  if (followsMe && iFollow) {
    relationship = 'friend'
  } else if (followsMe) {
    relationship = 'follower'
  } else if (iFollow) {
    relationship = 'following'
  }

  return relationship
}

export async function recomputeFollowers(): Promise<void> {
  log('Recomputing followers')

  const updatedAt = new Date().getTime()

  let users = await getUsers().exec()

  users.forEach(async (user) => {
    // Update users followers
    for (let followingId of user.following.data) {
      let followingUser = await getUser(followingId).exec()
      if (followingUser) {
        await followingUser.atomicPatch({
          followers: {
            updatedAt,
            data: uniq([...followingUser.followers.data, user.userId]),
          },
        })
      }
    }
  })

  // Update relationship for all users
  users = await getUsers().exec()
  const { myUserId } = await getAccount().exec()
  users.forEach(async (user) => {
    user.atomicPatch({
      relationship: {
        updatedAt,
        data: getRelationship(myUserId, user),
      },
    })
  })
}
