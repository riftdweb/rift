import { ContentRecordDAC } from '@skynetlabs/content-record-library'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { MySky, SkynetClient } from 'skynet-js'
import { triggerToast } from '../../shared/toast'
import { useLocalRootSeed } from '../useLocalRootSeed'
import { useSelectedPortal } from '../useSelectedPortal'
import { buildApi } from './buildApi'
// import { FeedDAC } from 'feed-dac-library'

// const feedDAC = new FeedDAC()
export const contentRecord = new ContentRecordDAC()

type State = {
  isInitializing: boolean
  Api: ReturnType<typeof buildApi>
  mySky: MySky
  loggedIn: boolean
  userId: string
  dataDomain: string
  login: () => void
  logout: () => void
  identityKey: string
}

const SkynetContext = createContext({} as State)
export const useSkynet = () => useContext(SkynetContext)

type Props = {
  children: React.ReactNode
}

export function SkynetProvider({ children }: Props) {
  const [portal] = useSelectedPortal()
  const { localRootSeed } = useLocalRootSeed()

  const [isInitializing, setIsInitializing] = useState<boolean>(true)
  const [userId, setUserId] = useState<string>()
  const [mySky, setMySky] = useState<MySky>()
  const [loggedIn, setLoggedIn] = useState(null)

  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  const parts = hostname.split('.')
  const subdomain = parts.slice(0, parts.length - 2).join('.')
  const dataDomain = subdomain || 'localhost'

  // When portal changes rebuild client
  const client = useMemo(() => new SkynetClient(`https://${portal}`), [portal])

  // On app init set up MySky
  useEffect(() => {
    async function initMySky() {
      try {
        console.log('Skynet Provider: initializing')
        // load invisible iframe and define app's data domain
        // needed for permissions write
        console.log('Data domain: ', dataDomain)
        const _mySky = await client.loadMySky(dataDomain, {
          // dev: true,
          // debug: true,
        })
        // load necessary DACs and permissions
        await _mySky.loadDacs(contentRecord)
        setMySky(_mySky)

        // check if user is already logged in with permissions
        const loggedIn = await _mySky.checkLogin()
        setLoggedIn(loggedIn)
        if (loggedIn) {
          setUserId(await _mySky.userID())
        }

        setIsInitializing(false)
        console.log('Skynet Provider: done initializing')
      } catch (e) {
        console.error(e)
      }
    }

    // call async setup function
    initMySky()
  }, [])

  const login = useCallback(() => {
    const func = async () => {
      if (isInitializing) {
        return
      }

      const status = await mySky.requestLoginAccess()

      // set react state
      setLoggedIn(status)

      if (status) {
        const userId = await mySky.userID()
        setUserId(userId)
        triggerToast(`Successfully logged in as ${userId.slice(0, 6)}...`)
      }
    }
    func()
  }, [isInitializing, mySky, setLoggedIn, setUserId])

  const logout = useCallback(() => {
    const func = async () => {
      await mySky.logout()

      setLoggedIn(false)
      setUserId('')
    }
    func()
  }, [mySky, setLoggedIn, setUserId])

  const Api = useMemo(
    () =>
      buildApi({
        portal,
        mySky,
        localRootSeed,
        dataDomain,
        userId,
      }),
    [mySky, portal, userId, dataDomain, localRootSeed]
  )

  // Key that can be used for SWR revalidation when identity changes
  const identityKey = userId ? userId : localRootSeed

  const value = {
    isInitializing,
    loggedIn,
    login,
    logout,
    mySky,
    userId,
    Api,
    identityKey,
    dataDomain,
  }

  return (
    <SkynetContext.Provider value={value}>{children}</SkynetContext.Provider>
  )
}
