// The following is the Skynet Skyfile metadata structure
// Skyfile {
//   contentType: string
//   metadata: {
//     filename: string
//     length: number
//     subfiles: {
//       [filename: string]: {
//         contenttype: string
//         filename: string
//         len: number
//         offset: number
//       }
//     }
//   }
//   skylink: string
// }

export type Subfile = {
  contenttype: string
  filename: string
  len: number
  offset?: number
  // System File object present during the upload only
  fileHandle?: File
  path?: string
}

export type SubfileMap = {
  [filename: string]: Subfile
}

export type Skyfile = {
  contentType: string
  metadata: {
    filename: string
    length: number
    subfiles: SubfileMap
    lastModified?: string
    path?: string
  }
  skylink: string
  id: string
  isDirectory: boolean
  upload: {
    status: string
    uploadedAt?: string
    updatedAt?: string
    ingressPortals: string[]
    progress?: number
    error?: string
  }
  // System File object present during the upload only
  fileHandle?: File
}

export type DomainKey = {
  id: string
  key: string
}

// Domain is either a MySky domain or an explicit seed (keypair)
export type Domain = {
  id: string
  dataDomain?: string
  // seed is the actual master seed concatenated with the child seed
  seed?: string
  parentSeed?: string
  name?: string
  childSeed?: string
  addedAt: string
  keys: DomainKey[]
}

export type AppRevision = {
  skyfile: string
  addedAt: string
}

export type App = {
  id: string
  name: string
  hnsDomain: string
  description: string
  addedAt: string
  tags: string[]
  // Revision's Skyfile
  lockedOn?: string
  revisions: AppRevision[]
}

export type DnsEntry = {
  id: string
  name: string
  skylink: string
  addedAt: string
  updatedAt: string
}
