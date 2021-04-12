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

  function getJSON({ seed, dataKey }: { seed?: string; dataKey: string }) {
    if (seed) {
      console.log(`getJSON ${dataKey}`)
      console.log('\texplicit tseed')
      const { publicKey } = genKeyPairFromSeed(seed)
      return client.db.getJSON(publicKey, dataKey)
    }
    if (!userId) {
      console.log(`getJSON ${dataKey}`)
      console.log('\tlocal seed')
      const { publicKey } = genKeyPairFromSeed(localRootSeed)
      return client.db.getJSON(publicKey, dataKey)
    }
    const dataPath = dataDomain + '/' + dataKey
    console.log(`getJSON ${dataPath}`)
    console.log('\tmysky')
    return mySky.getJSON(dataPath)
  }
  function setJSON({
    seed,
    dataKey,
    json,
  }: {
    seed?: string
    dataKey: string
    json: {}
  }) {
    if (seed) {
      console.log(`setJSON ${dataKey}`)
      console.log('\texplicit tseed')
      const { privateKey } = genKeyPairFromSeed(seed)
      return client.db.setJSON(privateKey, dataKey, json)
    }
    if (!userId) {
      console.log(`setJSON ${dataKey}`)
      console.log('\tlocal seed')
      const { privateKey } = genKeyPairFromSeed(localRootSeed)
      return client.db.setJSON(privateKey, dataKey, json)
    }
    const dataPath = dataDomain + '/' + dataKey
    console.log(`setJSON ${dataPath}`)
    console.log('\tmysky')
    return mySky.setJSON(dataDomain + '/' + dataKey, json)
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
