import { fileSystemDAC } from '..'
import { buildFsDirectory, buildFsFile } from './utils'

export async function getDirectoryIndex(directoryPath: string) {
  const _directoryIndex = await fileSystemDAC.getDirectoryIndex(directoryPath)

  const directories = Object.entries(_directoryIndex.directories).map(
    ([_, directory]) =>
      buildFsDirectory(directoryPath, directory.name, {
        data: directory,
      })
  )
  const files = Object.entries(_directoryIndex.files).map(([_, file]) =>
    buildFsFile(directoryPath, file.name, {
      data: file,
    })
  )

  return [...directories, ...files]
}
