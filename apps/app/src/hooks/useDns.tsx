import { DnsEntry } from '@riftdweb/types'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useHistory } from 'react-router-dom'
import useSWR from 'swr'
import { v4 as uuid } from 'uuid'
import { upsertItem } from '../shared/collection'
import { getDataKeyDomains } from '../shared/dataKeys'
import { triggerToast } from '../shared/toast'
import { useSkynet } from './skynet'

const dataKeyDomains = getDataKeyDomains()

type State = {
  dnsEntries: DnsEntry[]
  addDnsEntry: (dnsEntry: Partial<DnsEntry>) => Promise<boolean>
  updateDnsEntry: (
    id: string,
    dnsEntryUpdates: Partial<DnsEntry>
  ) => Promise<boolean>
  removeDnsEntry: (dnsEntryId: string, redirect?: boolean) => void
  isValidating: boolean
  userHasNoDnsEntries: boolean
}

const DnsContext = createContext({} as State)
export const useDns = () => useContext(DnsContext)

type Props = {
  children: React.ReactNode
}

export function DnsProvider({ children }: Props) {
  const [hasValidated, setHasValidated] = useState<boolean>(false)
  const [userHasNoDnsEntries, setUserHasNoDnsEntries] = useState<boolean>(false)
  const { Api, identityKey, dataDomain } = useSkynet()
  const history = useHistory()

  const key = [identityKey, dataDomain, dataKeyDomains]
  const { data, mutate, isValidating } = useSWR<{ data: DnsEntry[] }>(
    key,
    () =>
      Api.getJSON({
        dataKey: dataKeyDomains,
      }) as unknown as Promise<{
        data: DnsEntry[]
      }>
  )

  // Track whether the user has no dns entries yet so that we can adjust
  // how data validating states are handled
  useEffect(() => {
    if (!hasValidated && data) {
      setHasValidated(true)
      setUserHasNoDnsEntries(!data.data || !data.data.length)
    }
  }, [data, hasValidated, setHasValidated, setUserHasNoDnsEntries])

  const dnsEntries = useMemo(() => (data && data.data ? data.data : []), [data])

  const setDnsEntries = useCallback(
    (dnsEntries: DnsEntry[]) => {
      const func = async () => {
        // Update cache immediately
        mutate({ data: dnsEntries }, false)
        // Save changes to SkyDB
        await Api.setJSON({
          dataKey: dataKeyDomains,
          json: dnsEntries,
        })
        // Sync latest, will likely be the same
        await mutate()
      }
      func()
    },
    [Api, mutate]
  )

  // const saveEntry = useCallback(
  //   (id: string) => {
  //     const func = async () => {
  //       const dnsEntry = dnsEntries.find((e) => e.id === id)

  //       if (!dnsEntry) {
  //         return false
  //       }

  //       await Api.setJSON({
  //         dataKey: `${RESOURCE_DATA_KEY}/${dnsEntry.name}`,
  //         json: {
  //           domain: dnsEntry.name,
  //           skylink: dnsEntry.skylink,
  //         },
  //       })

  //       return true
  //     }
  //     return func()
  //   },
  //   [Api, dnsEntries]
  // )

  const addDnsEntry = useCallback(
    (dnsEntry: Partial<DnsEntry>): Promise<boolean> => {
      const func = async () => {
        if (!dnsEntry.name || !dnsEntry.skylink) {
          return false
        }

        const cleanDnsEntry: DnsEntry = {
          id: uuid(),
          name: dnsEntry.name,
          skylink: dnsEntry.skylink,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        setDnsEntries(upsertItem(dnsEntries, cleanDnsEntry, 'name'))
        return true
      }
      return func()
    },
    [dnsEntries, setDnsEntries]
  )

  const updateDnsEntry = useCallback(
    (id: string, dnsEntryUpdates: Partial<DnsEntry>): Promise<boolean> => {
      const func = async () => {
        const dnsEntry = dnsEntries.find((e) => e.id === id)

        if (!dnsEntry) {
          return false
        }

        const cleanDnsEntry: DnsEntry = {
          ...dnsEntry,
          skylink: dnsEntryUpdates.skylink,
          updatedAt: new Date().toISOString(),
        }

        setDnsEntries(upsertItem(dnsEntries, cleanDnsEntry, 'id'))

        triggerToast(`DNS entry '${cleanDnsEntry.name}' has been updated.`)
        return true
      }
      return func()
    },
    [dnsEntries, setDnsEntries]
  )

  const removeDnsEntry = useCallback(
    (id: string, redirect?: boolean) => {
      if (!id) {
        return
      }

      setDnsEntries(dnsEntries.filter((item) => item.id !== id))

      if (redirect) {
        history.push('/dns')
      }
    },
    [history, dnsEntries, setDnsEntries]
  )

  const value = {
    dnsEntries,
    addDnsEntry,
    updateDnsEntry,
    removeDnsEntry,
    isValidating,
    userHasNoDnsEntries,
  }

  return <DnsContext.Provider value={value}>{children}</DnsContext.Provider>
}
