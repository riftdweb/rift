import { useEffect, useMemo } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { useDomains } from './domains'

// Only for use within the data domains components under the /data route
export function useDomainParams() {
  const history = useHistory()
  const { pathname } = useLocation()
  const {
    domainName: encodedDomainName,
    dataKeyName: encodedDataKeyName,
  } = useParams()
  const domainName = decodeURIComponent(encodedDomainName)
  const dataKeyName = decodeURIComponent(encodedDataKeyName)
  const { domains, isValidating } = useDomains()

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

  useEffect(() => {
    const path = '/data'
    if (isValidating || pathname === path) {
      return
    }
    if (!domains.length) {
      history.push(path)
    }
    if (!domain) {
      history.push(path)
    }
    if (!domainKey) {
      history.push(path)
    }
  }, [isValidating, pathname, domains, domain, domainKey, history])

  return {
    domain,
    domainKey,
  }
}
