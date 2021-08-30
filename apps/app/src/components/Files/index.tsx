import { useFs } from '../../contexts/files'
import { createLogger } from '../../shared/logger'
import { FileExplorer } from './Explorer'
import { FileViewer } from './FileViewer'

const log = createLogger('files/Files')

export function Files() {
  const { activeFile } = useFs()

  if (activeFile) {
    return <FileViewer />
  }

  return <FileExplorer />
}
