import { useEffect, useState } from 'react'
import { useFs } from '@riftdweb/core'
import { useAccount } from '@riftdweb/core/src/hooks/useAccount'
import { fileSystemDAC } from '@riftdweb/core/src/services/account'

export function useSharingData() {
  const { isReady } = useAccount()
  const { activeNode, isActiveNodeShared } = useFs()

  const [shareReadLink, setShareReadLink] = useState<string>()
  const [shareReadTo, setShareReadTo] = useState<string>()

  useEffect(() => {
    if (!isReady) {
      return
    }
    const func = async () => {
      if (isActiveNodeShared) {
        setShareReadLink(window.location.href)
        return
      }

      const fullUriRead = (await fileSystemDAC.getShareUriReadOnly(
        activeNode.join('/')
      )) as string | { error: string }

      if (typeof fullUriRead !== 'string') {
        return
      }

      const uriRead = fullUriRead.replace('skyfs://', '')
      setShareReadLink(`${window.location.origin}/#/files/${uriRead}`)
      setShareReadTo(`/files/${uriRead}`)
    }
    func()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, activeNode])

  return {
    shareReadLink,
    shareReadTo,
  }
}
