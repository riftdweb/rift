import 'isomorphic-fetch';
require('dotenv').config();
import { getPostsReddit } from './bot/reddit';
// import { getPostsCnn } from './bot/cnn';
import { Post } from './bot/types';
import { writeFeed } from './skydb';
import { getPostsHn } from './bot/hn';

export type PostMap = { [id: string]: Post };

export async function main() {
  // // const postMapCnn = await getPostsCnn();
  // // await writeFeed(postMapCnn);
  const postMapHn = await getPostsHn();
  await writeFeed(postMapHn);
  const postMapReddit = await getPostsReddit();
  await writeFeed(postMapReddit);
}

main();
