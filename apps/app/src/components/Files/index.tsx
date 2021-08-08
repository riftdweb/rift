import { useState } from 'react'
import { useFs } from '../../contexts/files'
import { FileExplorer } from './FileExplorer'
import { FileViewer } from './FileViewer'

export function Files() {
  const {
    directoryIndex,
    createDirectory,
    setActiveDirectory,
    activeDirectory,
  } = useFs()
  const [value, setValue] = useState<string>('')
  console.log(directoryIndex.data)
  console.log('foo', activeDirectory)

  if (activeDirectory.length > 1) {
    return <FileViewer />
  }

  return <FileExplorer />
}
