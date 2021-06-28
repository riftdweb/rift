import { deriveChildSeed } from '@riftdweb/skynet-js-iso';
import { Post, PostMap } from './types';

const rootSeed = process.env.BOTS_SEED || 'bot';
const seedHn = deriveChildSeed(rootSeed, 'hn');

export async function getPostsHn(): Promise<PostMap> {
  let _results: Partial<Post>[] = [];

  try {
    const response = await fetch(
      'https://hacker-news.firebaseio.com/v0/topstories.json'
    );
    const stories = await response.json();

    const promises = stories.map(async (id: string) => {
      const response = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      );
      return await response.json();
    });

    _results = await Promise.all(promises);
  } catch (e) {
    // Sometimes the API rejects the request
    return {
      [seedHn]: {
        seed: seedHn,
        name: 'Hacker News',
        posts: [],
      },
    };
  }

  const results = _results.map((result: any) => ({
    id: result.id,
    ts: result.time * 1000,
    content: {
      title: result.title,
      link: `https://news.ycombinator.com/item?id=${result.id}`,
      tags: [],
    },
  })) as Post[];

  return {
    [seedHn]: {
      seed: seedHn,
      name: 'Hacker News',
      posts: results,
    },
  };
}
