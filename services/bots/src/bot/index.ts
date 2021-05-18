import 'isomorphic-fetch'
import { Post } from './types'
import { getStoriesHn } from './hn'
import { getStoriesReddit } from './reddit'
import { getStoriesCnn } from './cnn'

export type Story = {
  id: string
  title: string
  url: string
  time: number
  tags: string[]
}

export async function getPosts(): Promise<Post[]> {
  const storiesCnn = await getStoriesCnn()
  const storiesHn = await getStoriesHn()
  const storiesReddit = await getStoriesReddit()
  const stories = [...storiesCnn, ...storiesHn, ...storiesReddit]
  return stories.map((story) => ({
    id: story.id,
    ts: story.time,
    content: {
      title: story.title,
      link: story.url
        ? story.url
        : `https://news.ycombinator.com/item?id=${story.id}`,
      tags: story.tags,
    },
  })) as Post[]
}
