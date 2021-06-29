import { Post, PostMap } from './types';

export async function getPostsHn(): Promise<PostMap> {
  const seed = process.env.BOTS_PHRASE_HN as string;

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
      [seed]: {
        seed: seed,
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
    [seed]: {
      seed: seed,
      name: 'Hacker News',
      posts: results,
    },
  };
}
