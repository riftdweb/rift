import { useCallback, useEffect, useMemo } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { Domain, DomainKey } from '../../../../packages/types/src'
import { triggerToast } from '../shared/toast'
import { useDomains } from './domains'
import { usePath } from './path'
import { useSkynet } from './skynet'

type Return = {
  domain: Domain
  domainKey: DomainKey
  viewingUserId: string
  setViewingUserId: (userId: string) => void
  resetViewingUserId: () => void
  isViewingSelf: boolean
  isReadOnly: boolean
  isReadWrite: boolean
}

// Only for use within the data domains components under the /data route
export function useDomainParams(): Return {
  const history = useHistory()
  const { pathname } = useLocation()
  const { myUserId, appDomain } = useSkynet()
  const {
    viewingUserId,
    domainName: encodedDomainName,
    // First wildcard match
    0: dataKeyName,
  } = useParams()
  const domainName = decodeURIComponent(encodedDomainName)
  const { domains, addDomain, addKey, isValidating } = useDomains()

  const domain = useMemo(() => {
    if (!domainName) {
      return undefined
    }
    return domains.find((domain) => domain.name === domainName)
  }, [domains, domainName])

  const domainKey = useMemo(
    () => (domain ? domain.keys.find((key) => key.key === dataKeyName) : null),
    [domain, dataKeyName]
  )

  const { getDataPath, getDataBasePath } = usePath()

  const setViewingUserId = useCallback(
    (userId: string) => {
      history.push(
        getDataPath({
          userId,
          domainName,
          dataKeyName,
        })
      )
      triggerToast(`Switched to user ${userId.slice(0, 10)}...`)
    },
    [history, getDataPath, domainName, dataKeyName]
  )

  const resetViewingUserId = useCallback(() => {
    if (!myUserId) {
      history.push(getDataBasePath())
    } else {
      history.push(
        getDataPath({
          userId: myUserId,
          domainName,
          dataKeyName,
        })
      )
    }
    triggerToast(`Switched user back to self`)
  }, [history, getDataBasePath, getDataPath, myUserId, domainName, dataKeyName])

  useEffect(() => {
    // Routed to /data/mysky redirect to mysky base user path
    if (!viewingUserId && myUserId) {
      history.replace(
        getDataPath({
          userId: myUserId,
        })
      )
      return
    }
    const dataBaseUserPath = getDataPath()

    // If loading or at the base user path do nothing
    if (isValidating || pathname === dataBaseUserPath) {
      return
    }

    // If required path elements are missing redirect to base user path
    if (!domainName || !dataKeyName) {
      history.replace(dataBaseUserPath)
      return
    }

    // If the path parts do not exist in the user Rift domains, dynamically add them
    // If domain does not exist yet
    if (!domain) {
      addDomain({
        dataDomain: domainName,
        keys: [
          {
            id: dataKeyName,
            key: dataKeyName,
          },
        ],
      })
    }
    // If domain exists, but key does not
    else if (!domainKey) {
      addKey(domainName, {
        id: dataKeyName,
        key: dataKeyName,
      })
    }
  }, [
    getDataPath,
    isValidating,
    pathname,
    domains,
    viewingUserId,
    myUserId,
    domain,
    domainKey,
    domainName,
    dataKeyName,
    history,
    addDomain,
    addKey,
  ])

  const isViewingSelf = myUserId === viewingUserId
  const writeDomains = [appDomain]
  const isReadWrite =
    isViewingSelf &&
    domain &&
    (!!domain.seed || writeDomains.includes(domain.dataDomain))
  const isReadOnly = !isReadWrite

  return {
    domain,
    domainKey,
    viewingUserId,
    isViewingSelf,
    setViewingUserId,
    resetViewingUserId,
    isReadOnly,
    isReadWrite,
  }
}
