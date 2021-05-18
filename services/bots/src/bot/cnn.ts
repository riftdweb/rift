import { getStories, RssSourceMeta } from './rss'
import { Story } from '.'

export const meta: RssSourceMeta = {
  name: 'cnn',
  baseUrl: 'http://rss.cnn.com/rss/',
  dataPath: ['rss', 'channel', 'item'],
  sections: ['cnn_topstories', 'cnn_world', 'cnn_us', 'money_latest']
}

type RssEntryCnn = {
  title: string // 'Retirement contribution limits will rise in 2019',
  link: string // 'http://rss.cnn.com/~r/rss/money_latest/~3/5a-jS4gAPlY/index.html',
  guid: {
    isPermaLink: string // 'false',
    '$t': string // 'http://money.cnn.com/2018/11/01/retirement/irs-contributions/index.html'
  }
  'media:thumbnail': {
    url: string // 'http://i2.cdn.turner.com/money/dam/assets/170419100856-retirement-gold-120x90.jpg',
    height: string // '90',
    width: string // '120'
  }
  description: string // 'Good news retirement savers: The Internal Revenue Service announced cost of living increases to the contribution limits for retirement-related plans in 2019.<img src="http://feeds.feedburner.com/~r/rss/money_latest/~4/5a-jS4gAPlY" height="1" width="1" alt=""/>',
  pubDate: string // 'Thu, 01 Nov 2018 16:50:22 EDT',
  'feedburner:origLink': string // 'http://money.cnn.com/2018/11/01/retirement/irs-contributions/index.html'
}

function entriesToStories(entries: RssEntryCnn[], meta: RssSourceMeta, name: string): Story[] {
  return entries.map((entry: RssEntryCnn) => ({
    id: entry.guid['$t'],
    title: entry.title,
    url: entry.link,
    time: new Date(entry.pubDate).getTime(),
    tags: [meta.name, name],
  }))
}

export async function getStoriesCnn(): Promise<Story[]> {
  const stories = await getStories(meta, entriesToStories)
  console.log('reddit', stories.length)
  return stories
}