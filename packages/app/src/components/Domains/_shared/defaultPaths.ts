const pathsMap = {
  'crqa.hns': [
    // keep track of all skapp names
    'skapps.json',

    // keeps track of all new content entries
    '{appDomain}/newcontent/index.json',
    '{appDomain}/newcontent/page_0.json',
    '{appDomain}/newcontent/page_1.json',

    // // keeps track of all content interaction entries
    '{appDomain}/interactions/index.json',
    '{appDomain}/interactions/page_0.json',
    '{appDomain}/interactions/page_1.json',
  ],
  'riftapp.hns': ['apps', 'skyfiles', 'domains'],
  localhost: ['apps', 'skyfiles', 'domains'],
}

export function getDefaultPaths(appDomain: string, domain: string) {
  return (pathsMap[domain] || []).map((path) =>
    path.replace('{appDomain}', appDomain)
  )
}
