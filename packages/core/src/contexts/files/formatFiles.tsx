import { Skyfile } from '@riftdweb/types'
import { v4 as uuid } from 'uuid'
import { getRootDirectory } from './utils'

export function formatFiles(
  selectedFiles: any[],
  directoryMode: boolean
): Skyfile[] {
  let newUploadFiles: Skyfile[] = selectedFiles.map((file) => ({
    id: uuid(),
    contentType: file.type,
    metadata: {
      filename: file.name,
      length: file.size,
      subfiles: {
        [file.name]: {
          contenttype: file.type,
          filename: file.name,
          len: file.size,
          path: file.path,
        },
      },
      lastModified: file.lastModified,
      path: file.webkitRelativePath || file.path || file.name,
    },
    skylink: '',
    isDirectory: false,
    upload: {
      status: 'uploading',
      uploadedAt: undefined,
      updatedAt: new Date().toISOString(),
      ingressPortals: [],
      progress: undefined,
      error: undefined,
    },
    fileHandle: file,
  }))

  // get the file path from the first file
  const rootDir = getRootDirectory(newUploadFiles[0])

  // Files dropped without a directory
  if (directoryMode && rootDir === '.') {
    alert('Directory mode is selected and dropped files are not a directory.')
    return
  }

  // Warning: dropping multiple directories is possible and has wonky behaviour
  // File picker does not allow, otherwise no general way to handle.
  // Maybe check for whether root Dirs variations is greater than 1?

  let newSkyfiles: Skyfile[] =
    directoryMode && newUploadFiles.length
      ? [
          {
            id: uuid(),
            contentType: newUploadFiles.find(
              (skyfile) => skyfile.metadata.filename === 'index.html'
            )
              ? 'text/html'
              : 'application/zip',
            metadata: {
              filename: rootDir,
              length: newUploadFiles.reduce(
                (acc, skyfile) => acc + skyfile.metadata.length,
                0
              ),
              subfiles: newUploadFiles.reduce(
                (acc, skyfile) => ({
                  ...acc,
                  [skyfile.metadata.filename]: {
                    contenttype: skyfile.contentType,
                    filename: skyfile.metadata.filename,
                    len: skyfile.metadata.length,
                    path: skyfile.metadata.path,
                    fileHandle: skyfile.fileHandle,
                  },
                }),
                {}
              ),
            },
            skylink: '',
            isDirectory: true,
            upload: {
              status: 'uploading',
              uploadedAt: undefined,
              updatedAt: new Date().toISOString(),
              ingressPortals: [],
              progress: undefined,
              error: undefined,
            },
          },
        ]
      : newUploadFiles

  return newSkyfiles
}
