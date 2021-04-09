export type UploadDirectory = {
  name: string
  uploadFiles: UploadFile[]
}
export type UploadFile = {
  name: string
  path: string
  webkitRelativePath: string
  size: number
  lastModified: number
  type: string
  file: File
}

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

export type Upload = {
  id: string
  status: string
  url?: string
  uploadedAt?: string
  portal?: string
  skylink?: string
  progress?: number
  error?: string
  uploadFile?: UploadFile
  uploadDirectory?: UploadDirectory
}

export type Seed = {
  // id is the actual master seed concatenated with the child seed
  id: string
  parentSeed: string
  name?: string
  childSeed?: string
  addedAt: string
  keys: string[]
}
