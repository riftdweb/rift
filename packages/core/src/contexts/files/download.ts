import { DirectoryFile } from 'fs-dac-library/dist/cjs/skystandards'
import { fileSystemDAC } from '..'

export async function downloadFileToBlob(
  file: DirectoryFile,
  onProgress: (progress: number) => void
): Promise<string> {
  const blob = await fileSystemDAC.downloadFileData(
    file.file,
    file.mimeType,
    onProgress
  )
  return getObjectUrl(blob)
}

export async function getFileThumbnailUrl(
  file: DirectoryFile
): Promise<string> {
  const blob = await fileSystemDAC.loadThumbnail(file.ext?.thumbnail?.key)
  return getObjectUrl(blob)
}

export async function getAudioCoverUrl(file: DirectoryFile): Promise<string> {
  const blob = await fileSystemDAC.loadThumbnail(file.ext?.audio?.coverKey)
  return getObjectUrl(blob)
}

export function saveBlobToMachine(name: string, url: string) {
  // // IE doesn't allow using a blob object directly as link href
  // // instead it is necessary to use msSaveOrOpenBlob
  // if (window.navigator && window.navigator.msSaveOrOpenBlob) {
  //   window.navigator.msSaveOrOpenBlob(blob);
  //   return;
  // }

  // For other browsers:
  // Create a link pointing to the ObjectURL containing the blob.
  var link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(function () {
    // For Firefox it is necessary to delay revoking the ObjectURL
    window.URL.revokeObjectURL(url)
  }, 100)
}

function getObjectUrl(blob: Blob): string {
  // // IE doesn't allow using a blob object directly as link href
  // // instead it is necessary to use msSaveOrOpenBlob
  // if (window.navigator && window.navigator.msSaveOrOpenBlob) {
  //   window.navigator.msSaveOrOpenBlob(blob);
  //   return;
  // }

  // For other browsers:
  // Create a link pointing to the ObjectURL containing the blob.
  return window.URL.createObjectURL(blob)
}
