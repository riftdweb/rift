import {
  SkynetClient,
  MySky,
  genKeyPairFromSeed,
  CustomUploadOptions,
} from 'skynet-js'

type BuildApi = {
  portal: string
  mySky: MySky
  localRootSeed: string
  dataDomain: string
  userId?: string
}

export const buildApi = ({
  portal,
  mySky,
  localRootSeed,
  dataDomain,
  userId,
}: BuildApi) => {
  const client = new SkynetClient(`https://${portal}`)

  function getJSON({
    seed,
    dataKey,
    dataDomain: customDataDomain,
  }: {
    dataKey: string
    seed?: string
    dataDomain?: string
  }) {
    if (seed) {
      console.log(`getJSON ${dataKey} explicit seed`)
      const { publicKey } = genKeyPairFromSeed(seed)
      return client.db.getJSON(publicKey, dataKey)
    }
    if (!userId) {
      console.log(`getJSON ${dataKey} local seed`)
      const { publicKey } = genKeyPairFromSeed(localRootSeed)
      return client.db.getJSON(publicKey, dataKey)
    }
    const dataPath = (customDataDomain || dataDomain) + '/' + dataKey
    console.log(`getJSON ${dataKey} mysky`)
    return mySky.getJSON(dataPath)
  }
  function setJSON({
    seed,
    dataKey,
    dataDomain: customDataDomain,
    json,
  }: {
    seed?: string
    dataDomain?: string
    dataKey: string
    json: {}
  }) {
    if (seed) {
      console.log(`setJSON ${dataKey} explicit seed`)
      const { privateKey } = genKeyPairFromSeed(seed)
      return client.db.setJSON(privateKey, dataKey, json)
    }
    if (!userId) {
      console.log(`setJSON ${dataKey} local seed`)
      const { privateKey } = genKeyPairFromSeed(localRootSeed)
      return client.db.setJSON(privateKey, dataKey, json)
    }
    const dataPath = (customDataDomain || dataDomain) + '/' + dataKey
    console.log(`setJSON ${dataKey} mysky`)
    return mySky.setJSON(dataPath, json)
  }
  function uploadDirectory(
    directory: Record<string, File>,
    filename: string,
    customOptions?: CustomUploadOptions
  ) {
    return client.uploadDirectory(directory, filename, customOptions)
  }
  function uploadFile(file: File, customOptions?: CustomUploadOptions) {
    return client.uploadFile(file, customOptions)
  }
  function getMetadata(skylink: string) {
    return client.getMetadata(skylink)
  }
  function getFileContentHns(hnsDomain: string) {
    return client.getFileContentHns(hnsDomain)
  }

  return {
    getJSON,
    setJSON,
    uploadDirectory,
    uploadFile,
    getMetadata,
    getFileContentHns,
  }
}