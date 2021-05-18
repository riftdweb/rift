import { getStories, RssSourceMeta } from './rss'
import { Story } from '.'

export const meta: RssSourceMeta = {
  name: 'reddit',
  baseUrl: 'https://reddit.com/r/',
  dataPath: ['feed', 'entry'],
  sections: ['popular', 'tech', 'cryptocurrency', 'siacoin']
}

type RssEntryReddit = {
  author: {
    name: string // 'u/CommunityPoints'
    uri: string // 'https://www.reddit.com/user/CommunityPoints'
  }
  category: {
    term: string // 'CryptoCurrency'
    label: string // 'r/CryptoCurrency'
  }
  content: {
    type: string // 'html',
    '$t': string // html string
  }
  id: string // 't3_mvq0d8'
  link: {
    href: string // 'https://www.reddit.com/r/CryptoCurrency/comments/mvq0d8/new_moons_are_ready_round_12/'
  }
  updated: string // '2021-04-21T21:32:56+00:00',
  published: string // '2021-04-21T21:32:56+00:00',
  title: string // 'New Moons Are Ready! (Round 12)'
}

function entriesToStories(entries: RssEntryReddit[], meta: RssSourceMeta, section: string): Story[] {
  return entries.map((entry: any) => ({
    id: entry.id,
    title: entry.title,
    url: entry.link.href,
    time: new Date(entry.published).getTime(),
    tags: [meta.name, section],
  }))
}

export async function getStoriesReddit(): Promise<Story[]> {
  const stories = await getStories(meta, entriesToStories)
  console.log('reddit', stories.length)
  return stories
}