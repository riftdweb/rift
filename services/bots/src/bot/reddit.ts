import { getPosts, RssSourceMeta } from './rss';
import { Post, PostMap } from './types';

export const getMeta = (): RssSourceMeta => ({
  name: 'reddit',
  baseUrl: 'https://reddit.com/r/',
  dataPath: ['feed', 'entry'],
  sections: [
    {
      seed: process.env.BOTS_PHRASE_REDDIT_POPULAR as string,
      section: 'popular',
      name: 'Reddit Popular',
    },
    {
      seed: process.env.BOTS_PHRASE_REDDIT_TECH as string,
      section: 'tech',
      name: 'Reddit Tech',
    },
    {
      seed: process.env.BOTS_PHRASE_REDDIT_CRYPTOCURRENCY as string,
      section: 'cryptocurrency',
      name: 'Reddit CryptoCurrency',
    },
    {
      seed: process.env.BOTS_PHRASE_REDDIT_SIACOIN as string,
      section: 'siacoin',
      name: 'Reddit Siacoin',
    },
  ],
});

type RssEntryReddit = {
  author: {
    name: string; // 'u/CommunityPoints'
    uri: string; // 'https://www.reddit.com/user/CommunityPoints'
  };
  category: {
    term: string; // 'CryptoCurrency'
    label: string; // 'r/CryptoCurrency'
  };
  content: {
    type: string; // 'html',
    $t: string; // html string
  };
  id: string; // 't3_mvq0d8'
  link: {
    href: string; // 'https://www.reddit.com/r/CryptoCurrency/comments/mvq0d8/new_moons_are_ready_round_12/'
  };
  updated: string; // '2021-04-21T21:32:56+00:00',
  published: string; // '2021-04-21T21:32:56+00:00',
  title: string; // 'New Moons Are Ready! (Round 12)'
};

function entriesToPosts(entries: RssEntryReddit[]): Post[] {
  return entries.map((entry: any) => ({
    id: entry.id,
    ts: new Date(entry.published).getTime(),
    content: {
      title: entry.title,
      link: entry.link.href,
      tags: [],
    },
  }));
}

export async function getPostsReddit(): Promise<PostMap> {
  return await getPosts(getMeta(), entriesToPosts);
}
