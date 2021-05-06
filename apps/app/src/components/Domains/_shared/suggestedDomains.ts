export const SUGGESTED_DOMAINS = [
  'profile-dac.hns',
  'feed-dac.hns',
  'social-dac.hns',
  'crqa.hns',
]

const pathsMap = {
  'crqa.hns': [
    // keep track of all skapp names
    'skapps.json',

    // keeps track of all new content entries
    '{appDomain}/newcontent/index.json',
    '{appDomain}/newcontent/page_0.json',

    // // keeps track of all content interaction entries
    '{appDomain}/interactions/index.json',
    '{appDomain}/interactions/page_0.json',
  ],
  'feed-dac.hns': [
    // keep track of all skapp names
    'skapps.json',

    // keeps track of all new content entries
    '{appDomain}/posts/index.json',
    '{appDomain}/posts/page_0.json',
  ],
  'social-dac.hns': ['skapps.json', '{appDomain}/following.json'],
  'profile-dac.hns': ['profileIndex.json', 'preferencesIndex.json'],
  'riftapp.hns': ['apps', 'skyfiles', 'domains'],
  localhost: ['apps', 'skyfiles', 'domains'],
}

export function getDefaultPaths(appDomain: string, domain: string) {
  return (pathsMap[domain] || []).map((path) =>
    path.replace('{appDomain}', appDomain)
  )
}
