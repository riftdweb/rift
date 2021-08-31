import { DnsEntry } from '@riftdweb/types'
import { createLogger } from '@riftdweb/logger'
import { Feed } from '@riftdweb/types'
import { TaskQueue } from '@riftdweb/queue'
import { createContext, useCallback, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { parseSkylink } from 'skynet-js'
import useSWR, { SWRResponse } from 'swr'
import { v4 as uuid } from 'uuid'
import { upsertItem } from '../shared/collection'
import { getDataKeyDns } from '../shared/dataKeys'
import { triggerToast } from '../shared/toast'
import { useSkynet } from './skynet'

const dataKeyDns = getDataKeyDns()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = createLogger('dns')

const taskQueue = TaskQueue('dns')

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
  const { Api, getKey, appDomain } = useSkynet()
  const history = useHistory()

  const dns = useSWR<DnsEntryFeed>(
    getKey([appDomain, dataKeyDns]),
    async (): Promise<DnsEntryFeed> => {
      const result = await Api.getJSON<DnsEntryFeed>({
        path: dataKeyDns,
        priority: 4,
      })
      return (
        result.data || {
          updatedAt: 0,
          entries: [],
        }
      )
    },
    {
      revalidateOnFocus: false,
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
        const task = () =>
          Api.setJSON({
            path: dataKeyDns,
            json: dnsFeed,
            priority: 4,
          })
        await taskQueue.add(task, {
          meta: {
            name: dnsEntry.name,
            operation: 'set',
          },
        })

        // Sync latest, will likely be the same
        if (taskQueue.queue.length === 0) {
          await mutate()
        }
      }
      func()
    },
    [Api, mutate]
  )

  const updateRegistry = useCallback(
    (name: string, dataLink: string) => {
      const func = async () => {
        await Api.setDataLink({
          path: getDataKeyDns(name),
          dataLink,
        })

        return true
      }
      return func()
    },
    [Api]
  )

  const addDnsEntry = useCallback(
    (dnsEntry: Partial<DnsEntry>): Promise<boolean> => {
      const func = async () => {
        const { name, dataLink } = dnsEntry
        if (!name || !dataLink) {
          return false
        }

        const cleanDataLink = parseSkylink(dataLink)

        try {
          await updateRegistry(name, cleanDataLink)
        } catch (e) {
          triggerToast(`Failed to create DNS record '${name}'.`)
          return false
        }

        let entryLink = ''
        try {
          entryLink = await Api.getEntryLink({
            path: getDataKeyDns(name),
          })
        } catch (e) {
          triggerToast(`Failed to create DNS record '${name}'.`)
          return false
        }

        const cleanDnsEntry: DnsEntry = {
          id: uuid(),
          name,
          dataLink: cleanDataLink,
          addedAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
          entryLink,
        }

        setDnsEntries(cleanDnsEntry, 'name')
        triggerToast(`DNS record '${name}' has been created.`)
        return true
      }
      return func()
    },
    [Api, setDnsEntries, updateRegistry]
  )

  const updateDnsEntry = useCallback(
    (id: string, dnsEntryUpdates: Partial<DnsEntry>): Promise<boolean> => {
      const func = async () => {
        const dnsEntry = data?.entries.find((e) => e.id === id)

        if (!dnsEntry) {
          return false
        }

        const cleanDataLink = parseSkylink(dnsEntryUpdates.dataLink)

        const cleanDnsEntry: DnsEntry = {
          ...dnsEntry,
          dataLink: cleanDataLink,
          updatedAt: new Date().getTime(),
        }

        const { name, dataLink } = cleanDnsEntry

        setDnsEntries(cleanDnsEntry, 'id')
        try {
          await updateRegistry(name, dataLink)
          triggerToast(`DNS record '${name}' has been updated.`)
          return true
        } catch (e) {
          triggerToast(`Failed to update DNS record '${name}'.`)
          return false
        }
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
        const task = () =>
          Api.setJSON({
            path: dataKeyDns,
            json: dnsFeed,
            priority: 4,
          })
        await taskQueue.add(task, {
          meta: {
            name: id,
            operation: 'remove',
          },
        })

        // Sync latest, will likely be the same
        if (taskQueue.queue.length === 0) {
          await mutate()
        }
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
