import { FsDirectory, FsFile } from '..'

export function buildFsDirectory(
  basePath: string,
  name: string,
  data: Omit<FsDirectory, 'id' | 'path' | 'type'>
): FsDirectory {
  const type = 'directory'
  return {
    id: `${type}://${basePath}/${name}`,
    path: `${basePath}/${name}`,
    type: type,
    ...data,
  }
}

export function buildFsFile(
  basePath: string,
  name: string,
  data: Omit<FsFile, 'id' | 'path' | 'type'>
): FsFile {
  const type = 'file'
  return {
    id: `${type}://${basePath}/${name}`,
    path: `${basePath}/${name}`,
    type: type,
    ...data,
  }
}
