import { DirectoryFile } from 'fs-dac-library/dist/cjs/skystandards'
import { fileSystemDAC } from '../../contexts/skynet'

export async function downloadFile(file: DirectoryFile) {
  const blob = await fileSystemDAC.downloadFileData(file.file, file.mimeType)
  downloadBlob(file, blob)
}

export async function getFileUrl(file: DirectoryFile): Promise<string> {
  const blob = await fileSystemDAC.downloadFileData(file.file, file.mimeType)
  return getObjectUrl(file, blob)
}

function downloadBlob(file: DirectoryFile, blob: Blob) {
  // // IE doesn't allow using a blob object directly as link href
  // // instead it is necessary to use msSaveOrOpenBlob
  // if (window.navigator && window.navigator.msSaveOrOpenBlob) {
  //   window.navigator.msSaveOrOpenBlob(blob);
  //   return;
  // }

  // For other browsers:
  // Create a link pointing to the ObjectURL containing the blob.
  const data = window.URL.createObjectURL(blob)
  var link = document.createElement('a')
  link.href = data
  link.download = file.name
  link.click()
  setTimeout(function () {
    // For Firefox it is necessary to delay revoking the ObjectURL
    window.URL.revokeObjectURL(data)
  }, 100)
}

function getObjectUrl(file: DirectoryFile, blob: Blob): string {
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
