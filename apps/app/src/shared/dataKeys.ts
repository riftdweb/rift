const makeDataKeyFn = (version: string, namespace: string) => (
  str?: string
) => {
  return `${version}/${namespace}/${str || 'index'}.json`
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

export const dataVersionFs = 'v1'
export const getDataKeyFs = makeDataKeyFn(dataVersionFs, 'fs')

export const dataVersionDocs = 'v-1112'
export const getDataKeyDocs = makeDataKeyFn(dataVersionDocs, 'blocks')

export const dataKeysExportList = [
  getDataKeyApps(),
  getDataKeyFiles(),
  getDataKeyDomains(),
  getDataKeyDns(),
  getDataKeyFs(),
  getDataKeyDocs(),
]
