import { FsFile } from '../../contexts/files/types'
import { buildFsFile } from '../../contexts/files/utils'

export function formatUploads(
  directoryPath: string,
  selectedFiles: any[],
  existingFiles: FsFile[]
): FsFile[] {
  const now = new Date().getTime()

  return selectedFiles.map((file) => {
    const id = `file/${file.name}`
    const existingFile = existingFiles.find((ef) => ef.id === id)
    const existingVersion = existingFile?.data.version
    const nextVersion = existingVersion ? existingVersion + 1 : 0

    return buildFsFile(directoryPath, file.name, {
      data: {
        ext: {},
        created: now,
        modified: now,
        history: {},
        file: {
          ext: {},
          url: '',
          key: '',
          encryptionType: 'AEAD_XCHACHA20_POLY1305',
          size: file.size,
          chunkSize: 0,
          hash: '',
          ts: now,
        },
        ...existingFile?.data,
        name: file.name,
        mimeType: file.type,
        version: nextVersion,
      },
      status: 'uploading',
      upload: {
        uploadedAt: undefined,
        updatedAt: now,
        progress: 0,
        error: undefined,
        file: {
          fileHandle: file,
          type: file.type,
          filename: file.name,
          length: file.size,
          lastModified: file.lastModified,
          path: file.webkitRelativePath || file.path || file.name,
        },
      },
    })
  })
}
