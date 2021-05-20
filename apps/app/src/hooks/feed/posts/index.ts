import { feedDAC, socialDAC } from '../../skynet'
import { Post } from '../types'

export async function getPosts(userId): Promise<Post[]> {
  const followingUserIds = await socialDAC.getFollowingForUser(userId)

  // TODO: Load suggestions if signed out?

  let posts = []

  for (let followingUserId of followingUserIds) {
    for await (let batchOfPosts of feedDAC.loadPostsForUser(followingUserId)) {
      posts = posts.concat(
        batchOfPosts.map((post) => ({
          ...post,
          userId: followingUserId,
        }))
      )
    }
  }

  return posts
}
