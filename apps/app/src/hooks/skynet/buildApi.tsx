import {
  CustomUploadOptions,
  genKeyPairFromSeed,
  MySky,
  SkynetClient,
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
  // Ensure that this client is only recreated when necessary as this will
  // interfere with stateful features such as clearing cached revisions.
  const client = new SkynetClient(`https://${portal}`)

  function getJSON({
    seed,
    publicKey: customPublicKey,
    dataKey,
    dataDomain: customDataDomain,
  }: {
    dataKey: string
    seed?: string
    publicKey?: string
    dataDomain?: string
  }) {
    if (seed) {
      const { publicKey } = genKeyPairFromSeed(seed)
      console.log(`client.db.getJSON - explicit seed`)
      console.log(`\tpublic key: ${publicKey}`)
      console.log(`\tdata key: ${dataKey}`)
      return client.db.getJSON(publicKey, dataKey)
    }
    const dataPath = (customDataDomain || dataDomain) + '/' + dataKey
    if (customPublicKey) {
      console.log(`mySky.getJSON - mysky`)
      console.log(`\tdata path: ${dataPath}`)
      console.log(`\tpublic key: ${customPublicKey}`)
      return client.file.getJSON(customPublicKey, dataPath)
    }
    if (userId) {
      console.log(`mySky.getJSON - mysky`)
      console.log(`\tdata path: ${dataPath}`)
      return mySky.getJSON(dataPath)
    }
    const { publicKey } = genKeyPairFromSeed(localRootSeed)
    console.log(`client.db.getJSON - local app seed`)
    console.log(`\tpublic key: ${publicKey}`)
    console.log(`\tdata key: ${dataKey}`)
    return client.db.getJSON(publicKey, dataKey)
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
      const { privateKey } = genKeyPairFromSeed(seed)
      console.log(`client.db.setJSON - explicit seed`)
      console.log(`\tprivate key: ${privateKey}`)
      console.log(`\tdata key: ${dataKey}`)
      return client.db.setJSON(privateKey, dataKey, json)
    }
    if (!userId) {
      const { privateKey } = genKeyPairFromSeed(localRootSeed)
      console.log(`client.db.setJSON - local app seed`)
      console.log(`\tprivate key: ${privateKey}`)
      console.log(`\tdata key: ${dataKey}`)
      return client.db.setJSON(privateKey, dataKey, json)
    }
    const dataPath = (customDataDomain || dataDomain) + '/' + dataKey
    console.log(`mySky.setJSON - mysky`)
    console.log(`\tdata path: ${dataPath}`)
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
