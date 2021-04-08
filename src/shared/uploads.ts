import { Upload } from './types'

export const getSize = ({ uploadDirectory, uploadFile }: Upload) => {
  return uploadDirectory
    ? uploadDirectory.uploadFiles.reduce((acc, file) => acc + file.size, 0)
    : uploadFile.size
}
