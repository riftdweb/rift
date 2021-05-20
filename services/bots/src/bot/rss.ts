import parser from 'xml2json';
import { Post, PostMap } from './types';

export type Section = {
  seed: string;
  section: string;
  name: string;
};

export type RssSourceMeta = {
  name: string;
  baseUrl: string;
  dataPath: string[];
  sections: Section[];
};

export function rssToJson(data: any) {
  const json = parser.toJson(data) as any;
  return JSON.parse(json);
}

async function getSection<T>(
  meta: RssSourceMeta,
  section: Section
): Promise<T[]> {
  const response = await fetch(`${meta.baseUrl}${section.section}.rss`);
  const xml = await response.text();
  const json = rssToJson(xml) as any;

  let data: any = json;
  for (let key of meta.dataPath) {
    data = data[key];
  }

  if (!Array.isArray(data)) {
    data = [data];
  }

  return data as T[];
}

type EntriesToPosts<T> = (
  entries: T[]
  // meta: RssSourceMeta,
  // section: string
) => Post[];

export async function getPosts<T>(
  meta: RssSourceMeta,
  entriesToPosts: EntriesToPosts<T>
): Promise<PostMap> {
  let results: PostMap = {};

  for await (let section of meta.sections) {
    const entries = await getSection<T>(meta, section);
    results[section.seed] = {
      seed: section.seed,
      name: section.name,
      posts: entriesToPosts(entries),
    };
  }

  return results;
}
