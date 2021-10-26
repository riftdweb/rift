import {
  DirectoryFile,
  DirectoryIndex,
} from 'fs-dac-library/dist/cjs/skystandards'

type Directory = DirectoryIndex['directories']['']

export type FsNode = FsFile | FsDirectory

type Status = 'uploading' | 'pending' | 'complete' | 'error'

export type FsFile = {
  id: string
  path: string
  type: 'file'
  data: DirectoryFile
  status?: Status
  upload?: {
    uploadedAt?: number
    updatedAt: number
    progress: number
    error?: string
    file: {
      fileHandle: File
      type: string
      filename: string
      length: number
      lastModified: number
      path: string
    }
  }
}

export type FsDirectory = {
  id: string
  path: string
  type: 'directory'
  data: Directory
  status?: Status
}
