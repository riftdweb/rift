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
