const pathsMap = {
  'crqa.hns': [
    // keep track of all skapp names
    'skapps.json',

    // keeps track of all new content entries
    '{appDomain}/newcontent/index.json',
    '{appDomain}/newcontent/page_1.json',
    '{appDomain}/newcontent/page_2.json',

    // // keeps track of all content interaction entries
    '{appDomain}/interactions/index.json',
    '{appDomain}/interactions/page_1.json',
    '{appDomain}/interactions/page_2.json',
  ],
}

export function getDefaultPaths(appDomain: string, domain: string) {
  return (pathsMap[domain] || []).map((path) =>
    path.replace('{appDomain}', appDomain)
  )
}
