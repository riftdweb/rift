import { Domain, DomainKey } from '@riftdweb/types'
import debounce from 'lodash/debounce'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useHistory } from 'react-router-dom'
import { deriveChildSeed } from 'skynet-js'
import useSWR from 'swr'
import { upsertItem } from '../shared/collection'
import { SKYDB_DATA_KEY } from '../shared/dataKeys'
import { triggerToast } from '../shared/toast'
import { useSkynet } from './skynet'

type State = {
  domains: Domain[]
  addDomain: (domain: Partial<Domain>) => boolean
  removeDomain: (domainId: string, redirect?: boolean) => void
  addKey: (domainId: string, key: DomainKey) => boolean
  removeKey: (
    domainId: string,
    keyId: string,
    routeToNextKey?: boolean
  ) => boolean
  isValidating: boolean
  userHasNoDomains: boolean
  viewingUserId: string
  setViewingUserId: (userId: string) => void
  resetViewingUserId: () => void
}

const DomainsContext = createContext({} as State)
export const useDomains = () => useContext(DomainsContext)

type Props = {
  children: React.ReactNode
}

const debouncedMutate = debounce((mutate) => {
  return mutate()
}, 5000)

export function DomainsProvider({ children }: Props) {
  const [hasValidated, setHasValidated] = useState<boolean>(false)
  const [userHasNoDomains, setUserHasNoDomains] = useState<boolean>(false)
  const { Api, identityKey, dataDomain, userId } = useSkynet()
  const history = useHistory()

  const key = [identityKey, dataDomain, SKYDB_DATA_KEY]
  const { data, mutate, isValidating } = useSWR<{ data: Domain[] }>(
    key,
    () =>
      (Api.getJSON({
        dataKey: SKYDB_DATA_KEY,
      }) as unknown) as Promise<{
        data: Domain[]
      }>
  )

  // Track whether the user has no domains yet so that we can adjust
  // how data validating states are handled
  useEffect(() => {
    if (!hasValidated && data) {
      setHasValidated(true)
      setUserHasNoDomains(!data.data || !data.data.length)
    }
  }, [data, hasValidated, setHasValidated, setUserHasNoDomains])

  const domains = useMemo(() => (data && data.data ? data.data : []), [data])

  const setDomains = useCallback(
    (domains: Domain[]) => {
      const func = async () => {
        // Update cache immediately
        mutate({ data: domains }, false)
        // Save changes to SkyDB
        await Api.setJSON({
          dataKey: SKYDB_DATA_KEY,
          json: domains,
        })
        // Sync latest, will likely be the same
        await debouncedMutate(mutate)
      }
      func()
    },
    [Api, mutate]
  )

  const addDomain = useCallback(
    (domain: Partial<Domain>): boolean => {
      // Add MySky domain
      if (domain.dataDomain) {
        const validatedDomain: Domain = {
          id: domain.dataDomain,
          name: domain.dataDomain,
          dataDomain: domain.dataDomain,
          addedAt: new Date().toISOString(),
          keys: domain.keys || [],
        }

        setDomains(upsertItem(domains, validatedDomain))
        return true
      }

      // Add explicity seed
      if (!domain?.parentSeed || !domain.name) {
        return false
      }
      const cleanParentSeed = domain.parentSeed.trim()
      if (!cleanParentSeed) {
        return false
      }
      const cleanDomainName = domain.name.trim()
      if (!cleanDomainName) {
        return false
      }
      const cleanChildSeed = domain.childSeed.trim()

      const seedId = cleanChildSeed
        ? deriveChildSeed(cleanParentSeed, cleanChildSeed)
        : cleanParentSeed

      const validatedDomain: Domain = {
        id: seedId,
        seed: seedId,
        parentSeed: cleanParentSeed,
        name: cleanDomainName,
        childSeed: cleanChildSeed,
        addedAt: new Date().toISOString(),
        keys: domain.keys || [],
      }

      setDomains(upsertItem(domains, validatedDomain))
      return true
    },
    [domains, setDomains]
  )

  const addKey = useCallback(
    (domainId: string, key: DomainKey): boolean => {
      const domain = domains.find((domain) => domain.id === domainId)

      if (!domain) {
        return false
      }

      const cleanKey = {
        id: key.id.trim().replace(/\/{2,}/g, '/'),
        key: key.key.trim().replace(/\/{2,}/g, '/'),
      }

      const modifiedDomain = {
        ...domain,
        keys: upsertItem(domain.keys, cleanKey, 'id'),
      }

      setDomains(upsertItem(domains, modifiedDomain))
      return true
    },
    [domains, setDomains]
  )

  const removeKey = useCallback(
    (domainId: string, keyId: string, routeToNextKey?: boolean): boolean => {
      const domain = domains.find((domain) => domain.id === domainId)

      if (!domain) {
        return false
      }

      // When removing data keys in places like the editor we may want to route to another one
      if (routeToNextKey) {
        const dataKeyIndex = domain.keys.findIndex((key) => key.id === keyId)
        // load previous
        if (dataKeyIndex > 0) {
          history.push(
            `/data/${encodeURIComponent(domain.name)}/${encodeURIComponent(
              domain.keys[dataKeyIndex - 1].key
            )}`
          )
        }
        // load new first
        else if (dataKeyIndex === 0 && domain.keys.length > 1) {
          history.push(
            `/data/${encodeURIComponent(domain.name)}/${encodeURIComponent(
              domain.keys[1].key
            )}`
          )
        }
      }

      const modifiedDomain = {
        ...domain,
        keys: domain.keys.filter((k) => k.id !== keyId),
      }

      setDomains(upsertItem(domains, modifiedDomain))
      return true
    },
    [domains, setDomains, history]
  )

  const removeDomain = useCallback(
    (domainId: string, redirect?: boolean) => {
      if (!domainId) {
        return
      }

      setDomains(domains.filter((item) => item.id !== domainId))

      if (redirect) {
        history.push('/data')
      }
    },
    [history, domains, setDomains]
  )

  // State for switching the user data in view
  const [viewingUserId, _setViewingUserId] = useState<string>(userId)

  const setViewingUserId = useCallback(
    (userId: string) => {
      _setViewingUserId(userId)
      triggerToast(`Switched to user ${userId.slice(0, 10)}...`)
    },
    [_setViewingUserId]
  )

  const resetViewingUserId = useCallback(() => {
    _setViewingUserId(userId)
    triggerToast(`Switched user back to self`)
  }, [userId, _setViewingUserId])

  const value = {
    domains,
    addDomain,
    removeDomain,
    addKey,
    removeKey,
    isValidating,
    userHasNoDomains,
    viewingUserId,
    setViewingUserId,
    resetViewingUserId,
  }

  return (
    <DomainsContext.Provider value={value}>{children}</DomainsContext.Provider>
  )
}
