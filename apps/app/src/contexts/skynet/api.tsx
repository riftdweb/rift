import {
  CustomUploadOptions,
  genKeyPairFromSeed,
  MySky,
  SkynetClient,
} from 'skynet-js'
import { createLogger } from '../../shared/logger'
import { RateLimiter } from '../../shared/rateLimiter'

type BuildApi = {
  portal: string
  mySky: MySky
  localRootSeed: string
  appDomain: string
  userId?: string
}

export type Api = ReturnType<typeof buildApi>

const log = createLogger('api', {
  disable: true,
})

export const apiLimiter = RateLimiter('api/registry', {
  capacity: 30,
  ratePerMinute: 60,
  processingInterval: 50,
})

export const buildApi = ({
  portal,
  mySky,
  localRootSeed,
  appDomain,
  userId,
}: BuildApi) => {
  // Ensure that this client is only recreated when necessary as this will
  // interfere with stateful features such as clearing cached revisions.
  const client = new SkynetClient(`https://${portal}`)

  function getJSON<T>({
    seed,
    publicKey: customPublicKey,
    path,
    domain: customDomain,
    discoverable = false,
    priority = 0,
  }: {
    path: string
    seed?: string
    publicKey?: string
    domain?: string
    discoverable?: boolean
    priority?: number
  }) {
    type GetJSONReturn = Promise<{
      data: T | null
      dataLink: string | null
    }>

    const fullDataPath = (customDomain || appDomain) + '/' + path
    if (seed) {
      const { publicKey } = genKeyPairFromSeed(seed)
      log(`client.db.getJSON - explicit seed
        \tpublic key: ${publicKey.slice(0, 10)}...
        \tdata path: ${fullDataPath}
        \tdiscoverable: N/A`)
      const task = () =>
        (client.db.getJSON(publicKey, fullDataPath) as unknown) as GetJSONReturn
      return apiLimiter.add(task, {
        name: `get: ${publicKey.slice(0, 5)} ${fullDataPath}`,
        priority,
      })
    }
    if (customPublicKey) {
      log(`client.file.getJSON - mysky
        \tpublic key: ${customPublicKey.slice(0, 10)}...
        \tdata path: ${fullDataPath}
        \tdiscoverable: ${discoverable}`)

      if (discoverable) {
        const task = () =>
          (client.file.getJSON(
            customPublicKey,
            fullDataPath
          ) as unknown) as GetJSONReturn
        return apiLimiter.add(task, {
          name: `get: ${customPublicKey.slice(0, 5)} ${fullDataPath}`,
          priority,
        })
      }

      const task = () =>
        (client.file.getJSONEncrypted(
          customPublicKey,
          fullDataPath
        ) as unknown) as GetJSONReturn
      return apiLimiter.add(task, {
        name: `get: ${customPublicKey.slice(0, 5)} ${fullDataPath}`,
        priority,
      })
    }
    if (userId) {
      log(`mySky.getJSON - mysky
        \tdata path: ${fullDataPath}
        \tdiscoverable: ${discoverable}`)

      if (discoverable) {
        const task = () =>
          (mySky.getJSON(fullDataPath) as unknown) as GetJSONReturn
        return apiLimiter.add(task, {
          name: `get: ${userId.slice(0, 5)} ${fullDataPath}`,
          priority,
        })
      }
      const task = () =>
        (mySky.getJSONEncrypted(fullDataPath) as unknown) as GetJSONReturn
      return apiLimiter.add(task, {
        name: `get: ${userId.slice(0, 5)} ${fullDataPath}`,
        priority,
      })
    }
    const { publicKey } = genKeyPairFromSeed(localRootSeed)
    log(`client.db.getJSON - local app seed
      \tpublic key: ${publicKey.slice(0, 10)}...
      \tdata path: ${fullDataPath}
      \tdiscoverable: N/A`)

    const task = () =>
      (client.db.getJSON(publicKey, fullDataPath) as unknown) as GetJSONReturn
    return apiLimiter.add(task, {
      name: `get: ${publicKey.slice(0, 5)} ${fullDataPath}`,
      priority,
    })
  }

  function setJSON({
    seed,
    path,
    domain: customDomain,
    json,
    discoverable = false,
    priority = 0,
  }: {
    seed?: string
    domain?: string
    path: string
    json: {}
    discoverable?: boolean
    priority?: number
  }) {
    const fullDataPath = (customDomain || appDomain) + '/' + path
    if (seed) {
      const { privateKey } = genKeyPairFromSeed(seed)
      log(`client.db.setJSON - explicit seed
        \tprivate key: ${privateKey.slice(0, 10)}...
        \tdata path: ${fullDataPath}
        \tdiscoverable: N/A`)

      const task = () => client.db.setJSON(privateKey, fullDataPath, json)
      return apiLimiter.add(task, {
        name: `set: ${privateKey.slice(0, 5)} ${fullDataPath}`,
        priority,
      })
    }
    if (!userId) {
      const { privateKey } = genKeyPairFromSeed(localRootSeed)
      log(`client.db.setJSON - local app seed
        \tprivate key: ${privateKey.slice(0, 10)}
        \tdata path: ${fullDataPath}
        \tdiscoverable: N/A`)
      const task = () => client.db.setJSON(privateKey, fullDataPath, json)
      return apiLimiter.add(task, {
        name: `set: ${privateKey.slice(0, 5)} ${fullDataPath}`,
        priority,
      })
    }
    log(`mySky.setJSON - mysky
      \tdata path: ${fullDataPath}
      \tdiscoverable: ${discoverable}`)

    if (discoverable) {
      const task = () => mySky.setJSON(fullDataPath, json)
      return apiLimiter.add(task, {
        name: `set: ${userId.slice(0, 5)} ${fullDataPath}`,
        priority,
      })
    }

    const task = () => mySky.setJSONEncrypted(fullDataPath, json)
    return apiLimiter.add(task, {
      name: `set: ${userId.slice(0, 5)} ${fullDataPath}`,
      priority,
    })
  }

  async function setDataLink({
    seed,
    path,
    domain: customDomain,
    dataLink,
  }: {
    seed?: string
    domain?: string
    path: string
    dataLink: string
  }) {
    const fullDataPath = (customDomain || appDomain) + '/' + path
    if (seed) {
      const { privateKey } = genKeyPairFromSeed(seed)
      log(`client.db.setDataLink - explicit seed
        \tprivate key: ${privateKey.slice(0, 10)}
        \tdata path: ${fullDataPath}`)
      return client.db.setDataLink(privateKey, fullDataPath, dataLink)
    }
    if (!userId) {
      const { privateKey } = genKeyPairFromSeed(localRootSeed)
      log(`client.db.setDataLink - local app seed
        \tprivate key: ${privateKey.slice(0, 10)}
        \tdata path: ${fullDataPath}`)
      return client.db.setDataLink(privateKey, fullDataPath, dataLink)
    }
    log(`mySky.setDataLink - mysky
      \tdata path: ${fullDataPath}`)
    return mySky.setDataLink(fullDataPath, dataLink)
  }

  async function setEntry({
    seed,
    path,
    domain: customDomain,
    data,
  }: {
    seed?: string
    domain?: string
    path: string
    data: Uint8Array
  }) {
    const fullDataPath = (customDomain || appDomain) + '/' + path
    if (seed) {
      const { publicKey, privateKey } = genKeyPairFromSeed(seed)
      log(`client.registry.setEntry - explicit seed
        \tprivate key: ${privateKey.slice(0, 10)}
        \tdata path: ${fullDataPath}`)
      const reg = await client.registry.getEntry(publicKey, fullDataPath)
      const revision = reg.entry ? reg.entry.revision + BigInt(1) : BigInt(1)
      return client.registry.setEntry(privateKey, {
        dataKey: fullDataPath,
        data,
        revision,
      })
    }
    if (!userId) {
      const { publicKey, privateKey } = genKeyPairFromSeed(localRootSeed)
      log(`client.registry.setEntry - local app seed
        \tprivate key: ${privateKey.slice(0, 10)}
        \tdata path: ${fullDataPath}`)
      const reg = await client.registry.getEntry(publicKey, fullDataPath)
      const revision = reg.entry ? reg.entry.revision + BigInt(1) : BigInt(1)
      return client.registry.setEntry(privateKey, {
        dataKey: fullDataPath,
        data,
        revision,
      })
    }
    log(`mySky.setEntryData - mysky
      \tdata path: ${fullDataPath}`)
    return mySky.setEntryData(fullDataPath, data)
  }

  function getEntryLink({
    seed,
    path,
    domain: customDomain,
  }: {
    seed?: string
    domain?: string
    path: string
  }) {
    const fullDataPath = (customDomain || appDomain) + '/' + path
    if (seed) {
      const { publicKey } = genKeyPairFromSeed(seed)
      log(`client.registry.getEntryLink - explicit seed
        \tpublic key: ${publicKey.slice(0, 10)}...
        \tdata path: ${fullDataPath}`)
      return client.registry.getEntryLink(publicKey, fullDataPath)
    }
    if (!userId) {
      const { publicKey } = genKeyPairFromSeed(localRootSeed)
      log(`client.registry.getEntryLink - local app seed
        \tprivate key: ${publicKey}
        \tdata path: ${fullDataPath}`)
      return client.registry.getEntryLink(publicKey, fullDataPath)
    }
    log(`mySky.getEntryLink - mysky
      \tdata path: ${fullDataPath}`)
    return mySky.getEntryLink(fullDataPath)
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
    setEntry,
    getEntryLink,
    setDataLink,
    uploadDirectory,
    uploadFile,
    getMetadata,
    getFileContentHns,
  }
}
