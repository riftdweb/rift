import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { v4 as uuid } from 'uuid'
import useSWR from 'swr'
import { getJSON, setJSON } from '../shared/skynet'
import { useSelectedPortal } from './useSelectedPortal'
import { useLocalRootSeed } from './useLocalRootSeed'
import { App } from '../shared/types'
import { upsertItem } from '../shared/collection'
import { useRouter } from 'next/router'
import debounce from 'lodash/debounce'

const RESOURCE_DATA_KEY = 'apps'

type State = {
  apps: App[]
  addApp: (app: Partial<App>) => Promise<boolean>
  removeApp: (seedId: string, redirect?: boolean) => void
  isValidating: boolean
  userHasNoApps: boolean
}

const AppsContext = createContext({} as State)
export const useApps = () => useContext(AppsContext)

type Props = {
  children: React.ReactNode
}

const debouncedMutate = debounce((mutate) => {
  return mutate()
}, 5000)

export function AppsProvider({ children }: Props) {
  const [selectedPortal] = useSelectedPortal()
  const { localRootSeed } = useLocalRootSeed()
  const [hasValidated, setHasValidated] = useState<boolean>(false)
  const [userHasNoApps, setUserHasNoApps] = useState<boolean>(false)
  const { push } = useRouter()

  const { data, mutate, isValidating } = useSWR<{ data: App[] }>(
    [localRootSeed, RESOURCE_DATA_KEY],
    () => getJSON(selectedPortal, localRootSeed, RESOURCE_DATA_KEY)
  )

  // Track whether the user has no apps yet so that we can adjust
  // how data validating states are handled
  useEffect(() => {
    if (!hasValidated && data) {
      setHasValidated(true)
      setUserHasNoApps(!data.data || !data.data.length)
    }
  }, [data, hasValidated, setHasValidated, setUserHasNoApps])

  const apps = useMemo(() => (data && data.data ? data.data : []), [data])

  const setApps = useCallback(
    (apps: App[]) => {
      const func = async () => {
        // Update cache immediately
        mutate({ data: apps }, false)
        // Save changes to SkyDB
        await setJSON(selectedPortal, localRootSeed, RESOURCE_DATA_KEY, apps)
        // Sync latest, will likely be the same
        await debouncedMutate(mutate)
      }
      func()
    },
    [mutate]
  )

  const addApp = useCallback(
    (app: Partial<App>): Promise<boolean> => {
      const func = async () => {
        if (!app.name || !app.hnsDomain) {
          return false
        }

        const revisions = []

        const cleanApp: App = {
          id: uuid(),
          name: app.name,
          hnsDomain: app.hnsDomain,
          description: app.description,
          lockedOn: undefined,
          addedAt: new Date().toISOString(),
          tags: app.tags || [],
          revisions,
        }

        setApps(upsertItem(apps, cleanApp, 'hnsDomain'))
        return true
      }
      return func()
    },
    [apps, setApps]
  )

  const removeApp = useCallback(
    (id: string, redirect?: boolean) => {
      if (!id) {
        return
      }

      setApps(apps.filter((item) => item.id !== id))

      if (redirect) {
        push('/')
      }
    },
    [apps, setApps]
  )

  const value = {
    apps,
    addApp,
    removeApp,
    isValidating,
    userHasNoApps,
  }

  return <AppsContext.Provider value={value}>{children}</AppsContext.Provider>
}
