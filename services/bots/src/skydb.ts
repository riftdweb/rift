import { PostMap } from '.';
import { genKeyPairFromSeed } from '@riftdweb/skynet-js-iso';
import { Post } from './bot/types';
import { setJSON } from './bot/skynet';

const seed = process.env.BOT_SEED || 'bot';
const { publicKey } = genKeyPairFromSeed(seed);

type SavedPost = {
  data: Post;
  skylink: string;
};

export async function writeContentRecordsToSkyDb(postMap: PostMap) {
  const posts: Post[] = Object.entries(postMap).map(([_key, post]) => post);

  console.log(publicKey);

  const contentRecordsBasePath = `crqa.hns/${publicKey}/newcontent`;
  const timestamp = new Date().getTime();

  // Save each post individually
  const requests = posts.map((post) => {
    const func = async () => {
      const name = `data/${post.id}`;
      console.log(`Saving ${name}`);
      const res = await setJSON(seed, `data/${post.id}`, post as any);
      console.log(`\t${name} done`);
      return (res as unknown) as SavedPost;
    };
    return func;
  });

  let savedPosts: SavedPost[] = [];

  for await (let request of requests) {
    const savedPost = await request();
    savedPosts.push(savedPost);
  }

  console.log('all done');
  console.log(savedPosts);

  await setJSON(seed, `${contentRecordsBasePath}/index.json`, {
    version: 1,
    currPageNumber: 0,
    currPageNumEntries: savedPosts.length,
    pages: ['crqa.hns/localhost/newcontent/page_0.json'],
    pageSize: savedPosts.length,
  });
  console.log('saved index');

  await setJSON(seed, `${contentRecordsBasePath}/page_0.json`, {
    version: 1,
    indexPath: `${contentRecordsBasePath}/index.json`,
    pagePath: `${contentRecordsBasePath}/page_0.json`,
    entries: savedPosts.map(({ data, skylink }) => ({
      timestamp: timestamp,
      skylink: skylink,
      metadata: {
        ...data,
        skylink: skylink,
      },
    })),
  });
  console.log('saved page 0');
  console.log('done');
}
