import { App } from '@riftdweb/types'
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
import useSWR from 'swr'
import { v4 as uuid } from 'uuid'
import { upsertItem } from '../shared/collection'
import { getDataKeyApps } from '../shared/dataKeys'
import { useSkynet } from './skynet'

const dataKeyApps = getDataKeyApps()

type State = {
  apps: App[]
  addApp: (app: Partial<App>) => Promise<boolean>
  removeApp: (appId: string, redirect?: boolean) => void
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
  const [hasValidated, setHasValidated] = useState<boolean>(false)
  const [userHasNoApps, setUserHasNoApps] = useState<boolean>(false)
  const { Api, getKey, appDomain } = useSkynet()
  const history = useHistory()

  const { data, mutate, isValidating } = useSWR(
    getKey([appDomain, dataKeyApps]),
    () =>
      Api.getJSON<App[]>({
        path: dataKeyApps,
        priority: 2,
      }),
    {
      revalidateOnFocus: false,
    }
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
        mutate(
          (data) => ({
            data: apps,
            dataLink: data?.dataLink,
          }),
          false
        )
        // Save changes to SkyDB
        await Api.setJSON({
          path: dataKeyApps,
          json: apps,
          priority: 2,
        })
        // Sync latest, will likely be the same
        await debouncedMutate(mutate)
      }
      func()
    },
    [Api, mutate]
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
          addedAt: new Date().getTime(),
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
        history.push('/')
      }
    },
    [history, apps, setApps]
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
