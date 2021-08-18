const makeDataKeyFn = (version: string, defaultValue: string) => (
  str?: string
) => {
  return `${version}/${str || defaultValue}.json`
}

export const dataVersionUsers = 'v1'
export const getDataKeyUsers = makeDataKeyFn(dataVersionUsers, 'users')

export const dataVersionFeeds = 'v1'
export const getDataKeyFeeds = makeDataKeyFn(dataVersionFeeds, 'feeds')

export const dataVersionApps = 'v1'
export const getDataKeyApps = makeDataKeyFn(dataVersionApps, 'apps')

export const dataVersionFiles = 'v1'
export const getDataKeyFiles = makeDataKeyFn(dataVersionFiles, 'files')

export const dataVersionDomains = 'v1'
export const getDataKeyDomains = makeDataKeyFn(dataVersionDomains, 'domains')

export const dataVersionDns = 'v1'
export const getDataKeyDns = makeDataKeyFn(dataVersionDns, 'dns')

export const dataKeysExportList = [
  getDataKeyApps(),
  getDataKeyFiles(),
  getDataKeyDomains(),
  getDataKeyDns(),
]
