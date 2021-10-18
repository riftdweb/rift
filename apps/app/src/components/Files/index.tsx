import { useFs, useSkynet } from '@riftdweb/core'
import { Redirect } from 'react-router-dom'
import { FileExplorer } from './Explorer'
import { FileViewer } from './FileViewer'

export function Files() {
  const { myUserId, isReady } = useSkynet()
  const { activeFile } = useFs()

  if (isReady && !myUserId) {
    return <Redirect to={'/'} />
  }

  if (activeFile) {
    return <FileViewer />
  }

  return <FileExplorer />
}
