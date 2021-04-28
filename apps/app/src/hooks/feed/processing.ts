import retext from 'retext'
import keywords from 'retext-keywords'
import pos from 'retext-pos'
import { Post, ProcessedPost } from './types'

function extractKeywords(post: Post): Promise<Partial<ProcessedPost>> {
  const text = post.content.title
  return new Promise((resolve, reject) => {
    retext()
      .use(pos) // Make sure to use `retext-pos` before `retext-keywords`.
      .use(keywords)
      .process(text, (err, file) => {
        if (!err) {
          resolve({
            post,
            nlp: file,
          } as Partial<ProcessedPost>)
        } else {
          reject(err)
        }
      })
  })
}

export async function processPosts(
  posts: Post[]
): Promise<Partial<ProcessedPost>[]> {
  return await Promise.all(posts.map((post) => extractKeywords(post)))
}
