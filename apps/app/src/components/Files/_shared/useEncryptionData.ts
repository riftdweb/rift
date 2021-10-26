import { FsFile } from '@riftdweb/core'

export function useEncryptionData(file: FsFile) {
  const type = file.data.file.encryptionType
  const label = type.length > 10 ? `${type.slice(0, 10)}...` : type

  return {
    type,
    label,
  }
}
