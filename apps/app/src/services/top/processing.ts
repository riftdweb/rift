import { Entry } from '@riftdweb/types'
import retext from 'retext'
import keywords from 'retext-keywords'
import pos from 'retext-pos'

function extractKeywords(entry: Entry): Promise<Entry> {
  const text = entry.post.content.title || entry.post.content.text

  return new Promise((resolve, reject) => {
    retext()
      .use(pos) // Make sure to use `retext-pos` before `retext-keywords`.
      .use(keywords)
      .process(text, (err, file) => {
        if (!err) {
          resolve({
            ...entry,
            nlp: file,
          } as Entry)
        } else {
          reject(err)
        }
      })
  })
}

export async function processEntries(posts: Entry[]): Promise<Entry[]> {
  return await Promise.all(posts.map((post) => extractKeywords(post)))
}
