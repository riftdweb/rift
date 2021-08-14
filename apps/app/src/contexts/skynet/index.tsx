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
import { useLocalRootSeed } from '../../hooks/useLocalRootSeed'
import { usePortal } from '../../hooks/usePortal'
import { buildApi } from './api'
import { FeedDAC } from 'feed-dac-library'
import { UserProfileDAC } from '@skynethub/userprofile-library'
import { SocialDAC } from 'social-dac-library'
import { useUser } from '../../hooks/useProfile'
import { ControlRef, useControlRef } from './ref'
import { clearEntriesBuffer } from '../../workers/workerFeedLatest'
import { IUser } from '@riftdweb/types'

export const feedDAC = new FeedDAC()
export const userProfileDAC = new UserProfileDAC()
export const socialDAC = new SocialDAC()

type State = {
  isInitializing: boolean
  isReseting: boolean
  myUser: IUser
  Api: ReturnType<typeof buildApi>
  getKey: (resourceKeys: any[]) => any[] | null
  mySky: MySky
  loggedIn: boolean
  myUserId: string
  appDomain: string
  login: () => void
  logout: () => void
  identityKey: string
  controlRef: ControlRef
}

const SkynetContext = createContext({} as State)
export const useSkynet = () => useContext(SkynetContext)

type Props = {
  children: React.ReactNode
}

export function SkynetProvider({ children }: Props) {
  const { portal } = usePortal()
  const controlRef = useControlRef()
  const { localRootSeed } = useLocalRootSeed()

  const [isInitializing, setIsInitializing] = useState<boolean>(true)
  const [isReseting, setIsReseting] = useState<boolean>(false)
  const [myUserId, _setMyUserId] = useState<string>()
  const setMyUserId = useCallback(
    (userId: string) => {
      controlRef.current.myUserId = userId
      _setMyUserId(userId)
    },
    [controlRef, _setMyUserId]
  )
  const [Api, setApi] = useState<ReturnType<typeof buildApi>>()
  const myUser = useUser(myUserId)
  const [mySky, setMySky] = useState<MySky>()
  const [loggedIn, setLoggedIn] = useState(null)

  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  const parts = hostname.split('.')
  const subdomain = parts.slice(0, parts.length - 2).join('.')
  const appDomain = subdomain || 'localhost'

  // When portal changes rebuild client
  const client = useMemo(() => new SkynetClient(`https://${portal}`), [portal])

  const generateApi = useCallback(
    ({ userId, mySky }: { userId: string; mySky: any }) => {
      const api = buildApi({
        portal,
        localRootSeed,
        appDomain,
        // passed params to ensure latest value
        mySky,
        userId,
      })
      controlRef.current.Api = api
      setApi(api)
    },
    [controlRef, portal, localRootSeed, appDomain, setApi]
  )

  // On app init set up MySky
  useEffect(() => {
    const func = async () => {
      try {
        console.log('Skynet Provider: initializing')
        // load invisible iframe and define app's data domain
        // needed for permissions write
        console.log('App domain: ', appDomain)
        const _mySky = await client.loadMySky(appDomain, {
          // dev: true,
          // debug: true,
        })
        // load necessary DACs and permissions
        await _mySky.loadDacs(
          feedDAC as any,
          userProfileDAC as any,
          socialDAC as any
        )
        setMySky(_mySky)

        // check if user is already logged in with permissions
        const loggedIn = await _mySky.checkLogin()
        setLoggedIn(loggedIn)
        let userId = null
        if (loggedIn) {
          userId = await _mySky.userID()
          setMyUserId(userId)
        }

        generateApi({ userId, mySky: _mySky })

        setIsInitializing(false)
        console.log('Skynet Provider: done initializing')
      } catch (e) {
        console.error(e)
      }
    }

    func()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(() => {
    const func = async () => {
      if (isInitializing) {
        return
      }
      setIsReseting(true)

      const status = await mySky.requestLoginAccess()

      // set react state
      setLoggedIn(status)

      if (status) {
        const userId = await mySky.userID()
        setMyUserId(userId)
        generateApi({
          userId,
          mySky,
        })
        triggerToast(`Successfully logged in as ${userId.slice(0, 6)}...`)
      }

      // Initialization functions from other services
      clearEntriesBuffer()

      setIsReseting(false)
    }
    func()
  }, [
    isInitializing,
    mySky,
    setLoggedIn,
    setMyUserId,
    generateApi,
    setIsReseting,
  ])

  const logout = useCallback(() => {
    const func = async () => {
      setIsReseting(true)
      await mySky.logout()

      // Try to avoid glitchiness with resetting state across app by just reloading app on logout

      // setLoggedIn(false)
      // setUserId('')
      // generateApi({
      //   userId: null,
      //   mySky,
      // })
      // setIsReseting(false)

      window.location.href = '/'
    }
    func()
    // }, [mySky, setLoggedIn, setUserId, generateApi, setIsReseting])
  }, [mySky, setIsReseting])

  // Key that can be used for SWR revalidation when identity changes
  const identityKey = useMemo(() => {
    if (isInitializing || !Api || isReseting) {
      return null
    }
    return myUserId ? myUserId : localRootSeed
  }, [Api, isInitializing, isReseting, myUserId, localRootSeed])

  // Method for getting a namespaced SWR key
  const getKey = useMemo(() => {
    return (keys: any[]): any[] | null => {
      if (isInitializing || !Api || isReseting) {
        return null
      }
      return [identityKey, ...keys]
    }
  }, [identityKey, Api, isInitializing, isReseting])

  const value = {
    isInitializing,
    isReseting,
    loggedIn,
    login,
    logout,
    mySky,
    myUserId,
    Api,
    getKey,
    identityKey,
    appDomain,
    myUser,
    controlRef,
  }

  return (
    <SkynetContext.Provider value={value}>{children}</SkynetContext.Provider>
  )
}
