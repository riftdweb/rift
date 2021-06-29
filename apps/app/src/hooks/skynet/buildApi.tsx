import {
  CustomUploadOptions,
  genKeyPairFromSeed,
  MySky,
  SkynetClient,
} from 'skynet-js'
import { createLogger } from '../../shared/logger'

type BuildApi = {
  portal: string
  mySky: MySky
  localRootSeed: string
  dataDomain: string
  userId?: string
}

export type Api = ReturnType<typeof buildApi>

const log = createLogger('api')

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

  function getJSON<T>({
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
      log(`client.db.getJSON - explicit seed
        \tpublic key: ${publicKey}
        \tdata key: ${dataKey}`)
      return (client.db.getJSON(publicKey, dataKey) as unknown) as Promise<{
        data: T | null
        dataLink: string | null
      }>
    }
    const dataPath = (customDataDomain || dataDomain) + '/' + dataKey
    if (customPublicKey) {
      log(`mySky.getJSON - mysky
        \tdata path: ${dataPath}
        \tpublic key: ${customPublicKey}`)
      return (client.file.getJSON(
        customPublicKey,
        dataPath
      ) as unknown) as Promise<{
        data: T | null
        dataLink: string | null
      }>
    }
    if (userId) {
      log(`mySky.getJSON - mysky
        \tdata path: ${dataPath}`)
      return (mySky.getJSON(dataPath) as unknown) as Promise<{
        data: T | null
        dataLink: string | null
      }>
    }
    const { publicKey } = genKeyPairFromSeed(localRootSeed)
    log(`client.db.getJSON - local app seed
      \tpublic key: ${publicKey}
      \tdata key: ${dataKey}`)
    return (client.db.getJSON(publicKey, dataKey) as unknown) as Promise<{
      data: T | null
      dataLink: string | null
    }>
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
      log(`client.db.setJSON - explicit seed
        \tprivate key: ${privateKey}
        \tdata key: ${dataKey}`)
      return client.db.setJSON(privateKey, dataKey, json)
    }
    if (!userId) {
      const { privateKey } = genKeyPairFromSeed(localRootSeed)
      log(`client.db.setJSON - local app seed
        \tprivate key: ${privateKey}
        \tdata key: ${dataKey}`)
      return client.db.setJSON(privateKey, dataKey, json)
    }
    const dataPath = (customDataDomain || dataDomain) + '/' + dataKey
    log(`mySky.setJSON - mysky
      \tdata path: ${dataPath}`)
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
