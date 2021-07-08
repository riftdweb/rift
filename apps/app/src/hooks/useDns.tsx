import { DnsEntry } from '@riftdweb/types'
import { createContext, useCallback, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import useSWR, { SWRResponse } from 'swr'
import { v4 as uuid } from 'uuid'
import { upsertItem } from '../shared/collection'
import { getDataKeyDns } from '../shared/dataKeys'
import { triggerToast } from '../shared/toast'
import { Feed } from './feed/types'
import { useSkynet } from './skynet'

const dataKeyDns = getDataKeyDns()

type DnsEntryFeed = Feed<DnsEntry>

type State = {
  dns: SWRResponse<DnsEntryFeed, any>
  addDnsEntry: (dnsEntry: Partial<DnsEntry>) => Promise<boolean>
  updateDnsEntry: (
    id: string,
    dnsEntryUpdates: Partial<DnsEntry>
  ) => Promise<boolean>
  removeDnsEntry: (dnsEntryId: string, redirect?: boolean) => void
}

const DnsContext = createContext({} as State)
export const useDns = () => useContext(DnsContext)

type Props = {
  children: React.ReactNode
}

export function DnsProvider({ children }: Props) {
  const { Api, getKey, dataDomain } = useSkynet()
  const history = useHistory()

  const dns = useSWR<DnsEntryFeed>(
    getKey([dataDomain, dataKeyDns]),
    async (): Promise<DnsEntryFeed> => {
      const result = await Api.getJSON<DnsEntry[]>({
        dataKey: dataKeyDns,
      })
      return {
        updatedAt: 0,
        entries: result.data || [],
      }
    }
  )

  const { data, mutate } = dns

  const setDnsEntries = useCallback(
    (dnsEntry: DnsEntry, upsertKey: string) => {
      const func = async () => {
        // Update cache immediately
        const dnsFeed = await mutate(
          (feed) => ({
            updatedAt: new Date().getTime(),
            entries: upsertItem(feed.entries, dnsEntry, upsertKey),
          }),
          false
        )
        // Save changes to SkyDB
        await Api.setJSON({
          dataKey: dataKeyDns,
          json: dnsFeed,
        })
        // Sync latest, will likely be the same
        await mutate()
      }
      func()
    },
    [Api, mutate]
  )

  const updateRegistry = useCallback(
    (id: string) => {
      const func = async () => {
        const dnsEntry = data?.entries.find((e) => e.id === id)

        if (!dnsEntry) {
          return false
        }

        // await Api.setRegistryEntry({
        //   dataKey: getDataKeyDns(dnsEntry.name),
        //   data: dnsEntry.skylink,
        // })

        return true
      }
      return func()
    },
    [data]
    // [Api, data]
  )

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

        setDnsEntries(cleanDnsEntry, 'name')
        updateRegistry(cleanDnsEntry.id)
        return true
      }
      return func()
    },
    [setDnsEntries, updateRegistry]
  )

  const updateDnsEntry = useCallback(
    (id: string, dnsEntryUpdates: Partial<DnsEntry>): Promise<boolean> => {
      const func = async () => {
        const dnsEntry = data?.entries.find((e) => e.id === id)

        if (!dnsEntry) {
          return false
        }

        const cleanDnsEntry: DnsEntry = {
          ...dnsEntry,
          skylink: dnsEntryUpdates.skylink,
          updatedAt: new Date().toISOString(),
        }

        setDnsEntries(cleanDnsEntry, 'id')
        updateRegistry(cleanDnsEntry.id)

        triggerToast(`DNS entry '${cleanDnsEntry.name}' has been updated.`)
        return true
      }
      return func()
    },
    [data, setDnsEntries, updateRegistry]
  )

  const removeDnsEntry = useCallback(
    (id: string, redirect?: boolean) => {
      if (!id) {
        return
      }
      const func = async () => {
        // Update cache immediately
        const dnsFeed = await mutate(
          (dnsFeed) => ({
            updatedAt: new Date().getTime(),
            entries: dnsFeed.entries.filter((item) => item.id !== id),
          }),
          false
        )

        if (redirect) {
          history.push('/dns')
        }

        // Save changes to SkyDB
        await Api.setJSON({
          dataKey: dataKeyDns,
          json: dnsFeed,
        })

        // Sync latest, will likely be the same
        await mutate()
      }
      func()
    },
    [Api, mutate, history]
  )

  const value = {
    dns,
    addDnsEntry,
    updateDnsEntry,
    removeDnsEntry,
  }

  return <DnsContext.Provider value={value}>{children}</DnsContext.Provider>
}
