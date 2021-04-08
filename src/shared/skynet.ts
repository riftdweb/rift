import {
  SkynetClient,
  genKeyPairFromSeed,
  CustomUploadOptions,
  CustomDownloadOptions,
} from 'skynet-js'

// TODO
// Turn into a context with portal prepopulated
// Explore hooks with status state built in: https://github.com/dghelm/skynet-encode-hackathon

export function getJSON(portal: string, seed: string, dataKey: string) {
  const client = new SkynetClient(`https://${portal}`)
  const { publicKey } = genKeyPairFromSeed(seed)
  return client.db.getJSON(publicKey, dataKey, { timeout: 20 })
}

export function setJSON(
  portal: string,
  seed: string,
  dataKey: string,
  json: {}
) {
  const client = new SkynetClient(`https://${portal}`)
  const { privateKey } = genKeyPairFromSeed(seed)
  return client.db.setJSON(privateKey, dataKey, json, undefined, {
    timeout: 20,
  })
}

export function uploadDirectory(
  portal: string,
  directory: Record<string, File>,
  filename: string,
  customOptions?: CustomUploadOptions
) {
  const client = new SkynetClient(`https://${portal}`)
  return client.uploadDirectory(directory, filename, customOptions)
}

export function uploadFile(
  portal: string,
  file: File,
  customOptions?: CustomUploadOptions
) {
  const client = new SkynetClient(`https://${portal}`)
  return client.uploadFile(file, customOptions)
}

export function getMetadata(
  portal: string,
  skylink: string,
  customOptions?: CustomDownloadOptions
) {
  const client = new SkynetClient(`https://${portal}`)
  return client.getMetadata(skylink, customOptions)
}

export function getSkylinkUrl(
  portal: string,
  skylinkUrl: string,
  customOptions?: CustomDownloadOptions
) {
  const client = new SkynetClient(`https://${portal}`)
  return client.getSkylinkUrl(skylinkUrl, customOptions)
}

export function openFile(
  portal: string,
  skylinkUrl: string,
  customOptions?: CustomDownloadOptions
) {
  const client = new SkynetClient(`https://${portal}`)
  return client.openFile(skylinkUrl, customOptions)
}

export function downloadFile(portal: string, skylink: string) {
  const client = new SkynetClient(`https://${portal}`)
  return client.downloadFile(skylink)
}
