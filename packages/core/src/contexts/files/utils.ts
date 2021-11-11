import { FsDirectory, FsFile } from '..'

export function getNodePathPath(nodePath: string): string {
  if (nodePath.startsWith('r:') || nodePath.startsWith('rw:')) {
    return `skyfs://${nodePath}`
  }
  return nodePath
}

export function getNodePath(node: string[]): string {
  return getNodePathPath(node.join('/'))
}

export function buildFsDirectory(
  basePath: string,
  name: string,
  data: Omit<FsDirectory, 'id' | 'path' | 'type'>
): FsDirectory {
  const type = 'directory'
  return {
    id: `${type}://${basePath}/${name}`,
    path: getNodePathPath(`${basePath}/${name}`),
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
    path: getNodePathPath(`${basePath}/${name}`),
    type: type,
    ...data,
  }
}
