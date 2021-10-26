import { FsFile } from '@riftdweb/core'

export function useVersionData(file: FsFile) {
  return file.data.version + 1
}
