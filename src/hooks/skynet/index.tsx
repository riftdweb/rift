import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { SkynetClient, MySky } from 'skynet-js'
import { useSelectedPortal } from '../useSelectedPortal'
import { ContentRecordDAC } from '@skynethq/content-record-library'
import { triggerToast } from '../../shared/toast'
import { useLocalRootSeed } from '../useLocalRootSeed'
import { buildApi } from './buildApi'
// import { FeedDAC } from 'feed-dac-library'

// const feedDAC = new FeedDAC()
const contentRecord = new ContentRecordDAC()

type State = {
  isInitializing: boolean
  Api: ReturnType<typeof buildApi>
  mySky: MySky
  loggedIn: boolean
  userId: string
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

  const dataDomain =
    typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  // console.log('dataDomain', dataDomain)

  // When portal changes rebuild client
  const client = useMemo(() => new SkynetClient(`https://${portal}`), [portal])

  // On app init set up MySky
  useEffect(() => {
    async function initMySky() {
      try {
        console.log('Skynet Provider: initializing')
        // load invisible iframe and define app's data domain
        // needed for permissions write
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
      console.log(status)
      // window.mySky = mySky

      // set react state
      setLoggedIn(status)

      if (status) {
        const userId = await mySky.userID()
        setUserId(userId)
        triggerToast(`Successfully logged in as ${userId.slice(0, 6)}...`)
      }

      // TODO: refresh data
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
  const identityKey = localRootSeed + '/' + userId

  const value = {
    isInitializing,
    loggedIn,
    login,
    logout,
    mySky,
    userId,
    Api,
    identityKey,
  }

  return (
    <SkynetContext.Provider value={value}>{children}</SkynetContext.Provider>
  )
}
