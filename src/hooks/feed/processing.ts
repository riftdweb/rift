import { ProcessedPost, Post } from './types'
import retext from 'retext'
import pos from 'retext-pos'
import keywords from 'retext-keywords'

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
