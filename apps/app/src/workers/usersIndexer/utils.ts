import { IUser, RelationshipType } from '@riftdweb/types'
import uniq from 'lodash/uniq'
import { ControlRef } from '../../contexts/skynet/ref'
import { log } from '.'

export async function recomputeFollowers(ref: ControlRef): Promise<void> {
  log('Recomputing followers')

  const updatedAt = new Date().getTime()

  // Start with map of all users
  const updatedUsersMap = ref.current.usersMap.data.entries

  ref.current.discoveredUsersIndex.forEach((user) => {
    // Update users followers
    for (let followingId of user.following.data) {
      let followingUser = updatedUsersMap[followingId]
      if (followingUser) {
        followingUser = {
          ...followingUser,
          followers: {
            updatedAt,
            data: uniq([...followingUser.followers.data, user.userId]),
          },
        }
        updatedUsersMap[followingId] = followingUser
      }
    }
  })

  // Update relationship for all users
  const updatedUsers = Object.entries(updatedUsersMap).map(
    ([userId, user]) => ({
      ...user,
      relationship: {
        updatedAt,
        data: getRelationship(ref, user),
      },
    })
  )

  await ref.current.upsertUsers(updatedUsers)
}

function getRelationship(ref: ControlRef, user: IUser): RelationshipType {
  const followsMe = user.following.data.includes(ref.current.myUserId)
  const iFollow = user.followers.data.includes(ref.current.myUserId)

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
