import { useFs } from '@riftdweb/core/src/contexts/files'
import { FileExplorer } from './Explorer'
import { FileViewer } from './FileViewer'

export function Files() {
  const { activeFile } = useFs()

  if (activeFile) {
    return <FileViewer />
  }

  return <FileExplorer />
}
