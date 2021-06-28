import { deriveChildSeed } from '@riftdweb/skynet-js-iso';
import { getPosts, RssSourceMeta } from './rss';
import { Post, PostMap } from './types';

const rootSeed = process.env.BOTS_SEED || 'bot';

export const meta: RssSourceMeta = {
  name: 'cnn',
  baseUrl: 'http://rss.cnn.com/rss/',
  dataPath: ['rss', 'channel', 'item'],
  sections: [
    {
      seed: deriveChildSeed(rootSeed, 'cnn cnn_topstories'),
      section: 'cnn_topstories',
      name: 'CNN Top Stories',
    },
    {
      seed: deriveChildSeed(rootSeed, 'cnn cnn_world'),
      section: 'cnn_world',
      name: 'CNN World',
    },
    {
      seed: deriveChildSeed(rootSeed, 'cnn cnn_us'),
      section: 'cnn_us',
      name: 'CNN US',
    },
    {
      seed: deriveChildSeed(rootSeed, 'cnn money_latest'),
      section: 'money_latest',
      name: 'CNN Money Latest',
    },
  ],
};

type RssEntryCnn = {
  title: string; // 'Retirement contribution limits will rise in 2019',
  link: string; // 'http://rss.cnn.com/~r/rss/money_latest/~3/5a-jS4gAPlY/index.html',
  guid: {
    isPermaLink: string; // 'false',
    $t: string; // 'http://money.cnn.com/2018/11/01/retirement/irs-contributions/index.html'
  };
  'media:thumbnail': {
    url: string; // 'http://i2.cdn.turner.com/money/dam/assets/170419100856-retirement-gold-120x90.jpg',
    height: string; // '90',
    width: string; // '120'
  };
  description: string; // 'Good news retirement savers: The Internal Revenue Service announced cost of living increases to the contribution limits for retirement-related plans in 2019.<img src="http://feeds.feedburner.com/~r/rss/money_latest/~4/5a-jS4gAPlY" height="1" width="1" alt=""/>',
  pubDate: string; // 'Thu, 01 Nov 2018 16:50:22 EDT',
  'feedburner:origLink': string; // 'http://money.cnn.com/2018/11/01/retirement/irs-contributions/index.html'
};

function entriesToPosts(entries: RssEntryCnn[]): Post[] {
  return entries.map((entry: RssEntryCnn) => ({
    id: entry.guid['$t'],
    ts: new Date(entry.pubDate).getTime(),
    content: {
      title: entry.title,
      link: entry.link,
      tags: [],
    },
  }));
}

export async function getPostsCnn(): Promise<PostMap> {
  return await getPosts(meta, entriesToPosts);
}
