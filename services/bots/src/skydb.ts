import { PostMap, SectionData } from './bot/types';
import { setJSON } from './bot/skynet';
import { phraseToSeed } from './bot/mysky';
import { genKeyPairFromSeed } from './bot/mysky/utils';

const profileAvatarMap = {
  cnn: 'sia:OAC_gz0VGFL_Pkg92YOswG7rgy8KXRK_Ph9_HyiPNiPjww',
  reddit: 'sia:KADkguepy_1lyV_QLgkxseq7E5p8o3fJn8JNi7CrWuEEpg',
  hn: 'sia:AAD_BpavFKpBFnH2KEhTd0uEANEy_BDtEvBCkmSbnQXnww',
};

export async function writePosts(section: SectionData) {
  // const { publicKey } = genKeyPairFromSeed(section.seed);
  const seed = phraseToSeed(section.seed);
  // genKeyPairFromSeed is NOT from skynet-js
  const { publicKey } = genKeyPairFromSeed(seed);

  updateProfile(section);

  const namespace = 'riftapp.hns';
  const feedDacBasePath = `feed-dac.hns`;
  const feedDacPostsBasePath = `feed-dac.hns/${namespace}/posts`;

  await setJSON(section.seed, `${feedDacBasePath}/skapps.json`, {
    [namespace]: true,
  });

  await setJSON(section.seed, `${feedDacPostsBasePath}/index.json`, {
    version: 1,
    currPageNumber: 0,
    currPageNumEntries: section.posts.length,
    pages: [`feed-dac.hns/${namespace}/posts/page_0.json`],
    pageSize: section.posts.length,
  });

  await setJSON(section.seed, `${feedDacPostsBasePath}/page_0.json`, {
    version: 1,
    indexPath: `${feedDacPostsBasePath}/index.json`,
    _self: `${feedDacPostsBasePath}/page_0.json`,
    items: section.posts,
  });

  console.log(`${section.name}`);
  console.log(`userId: ${publicKey}`);
  console.log(`${section.posts.length} posts`);
  console.log(
    `https://riftapp.hns.fileportal.org/#/data/mysky/${publicKey}/${feedDacPostsBasePath}/index.json`
  );
  console.log(
    `https://riftapp.hns.fileportal.org/#/data/mysky/${publicKey}/${feedDacPostsBasePath}/page_0.json`
  );
  console.log('');
}

export async function writeFeed(postMap: PostMap) {
  Object.entries(postMap).forEach(([_seed, section]) => {
    writePosts(section);
  });
}

export async function updateProfile(section: SectionData) {
  const profileDacBasePath = `profile-dac.hns`;
  let url = '';
  if (section.name.startsWith('Hacker')) {
    url = profileAvatarMap.hn;
  }
  if (section.name.startsWith('Reddit')) {
    url = profileAvatarMap.reddit;
  }
  if (section.name.startsWith('CNN')) {
    url = profileAvatarMap.cnn;
  }
  const profile = {
    version: 1,
    profile: {
      version: 1,
      username: section.name,
      firstName: '',
      lastName: '',
      emailID: '',
      contact: '',
      aboutMe: `Hello, I'm a bot that shares the best content from ${section.name} onto Skynet! Follow me to keep up with the latest stories!`,
      location: 'Decentralized',
      topics: [],
      connections: [
        {
          twitter: '',
        },
        {
          facebook: '',
        },
        {
          github: '',
        },
        {
          reddit: '',
        },
        {
          telegram: '',
        },
      ],
      avatar: [
        {
          ext: 'jpeg',
          w: 300,
          h: 300,
          url,
        },
      ],
    },
    lastUpdatedBy: 'riftapp.hns',
    historyLog: [
      {
        updatedBy: 'riftapp.hns',
        timestamp: '2021-05-13T21:32:54.069Z',
      },
    ],
  };

  await setJSON(
    section.seed,
    `${profileDacBasePath}/profileIndex.json`,
    profile
  );
}
