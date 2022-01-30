import { useFs } from '@riftdweb/core'
import { useAccount } from '@riftdweb/core/src/hooks/useAccount'
import { Redirect } from 'react-router-dom'
import { FileExplorer } from './Explorer'
import { FileViewer } from './FileViewer'

export function Files() {
  const { myUserId, isReady } = useAccount()
  const { activeFile, isActiveNodeShared } = useFs()

  if (isReady && !myUserId && !isActiveNodeShared) {
    return <Redirect to="/" />
  }

  if (activeFile) {
    return <FileViewer />
  }

  return <FileExplorer />
}
