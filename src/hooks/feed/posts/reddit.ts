import { rssToJson } from './rss'
import { popular, tech } from './redditData'
import { Story } from '.'

function entriesToStories(entries, name) {
  return entries.map((entry) => ({
    id: entry.id['#text'],
    title: entry.title['#text'],
    url: entry.link['@attributes']['href'],
    time: new Date(entry.published['#text']).getTime(),
    tags: ['reddit', name],
  }))
}

export async function getStoriesReddit(): Promise<Story[]> {
  const ls = localStorage.getItem('reddit')

  if (ls) {
    return JSON.parse(ls)
  }

  const popularData = rssToJson(popular) as any
  const techData = rssToJson(tech) as any

  const results = [
    ...entriesToStories(popularData.feed.entry, 'popular'),
    ...entriesToStories(techData.feed.entry, 'tech'),
  ]

  localStorage.setItem('reddit', JSON.stringify(results))
  return results
}
