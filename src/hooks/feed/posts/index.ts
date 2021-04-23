import { Post } from '../types'
import { v4 as uuid } from 'uuid'
import { getStoriesHn } from './hn'
import { getStoriesReddit } from './reddit'

export type Story = {
  id: number
  title: string
  url: string
  time: number
  tags: string[]
}

export async function getPosts(): Promise<Post[]> {
  const storiesHn = await getStoriesHn()
  const storiesReddit = await getStoriesReddit()
  const stories = [...storiesHn, ...storiesReddit]
  return stories.map((story) => ({
    id: uuid(),
    ts: story.time,
    content: {
      title: story.title,
      link: story.url
        ? story.url
        : `https://news.ycombinator.com/item?id=${story.id}`,
      tags: story.tags,
    },
  }))
}
