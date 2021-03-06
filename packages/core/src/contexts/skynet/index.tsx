import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { FeedDAC } from 'feed-dac-library'
// import { UserProfileDAC } from '@skynethub/userprofile-library'
import { SocialDAC } from 'social-dac-library'
import { FileSystemDAC } from 'fs-dac-library'
import { clearAllTaskQueues } from '@riftdweb/queue'
import { createLogger } from '@riftdweb/logger'
import { MySky, SkynetClient } from 'skynet-js'
import { triggerToast } from '../../shared/toast'
import { useLocalRootSeed } from '../../hooks/useLocalRootSeed'
import { usePortal } from '../../hooks/usePortal'
import { buildApi } from './api'
import { ControlRef, useControlRef } from './ref'
import { clearEntriesBuffer } from '../../services/feedAggregator'
import { clearAllTokens } from '../../services/tokens'

const log = createLogger('contexts/skynet', {
  disable: true,
})

export const feedDAC = new FeedDAC()
// export const userProfileDAC = new UserProfileDAC()
export const socialDAC = new SocialDAC()
export const fileSystemDAC = new FileSystemDAC()

// @ts-ignore
window.dacs = {
  feedDAC,
  // userProfileDAC,
  socialDAC,
  fileSystemDAC,
}

type State = {
  isReady: boolean
  isInitializing: boolean
  isReseting: boolean
  Api: ReturnType<typeof buildApi>
  getKey: (resourceKeys: any[]) => any[] | null
  mySky: MySky
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
  const [mySky, setMySky] = useState<MySky>()

  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  const appDomain = hostname === 'localhost' ? 'localhost' : 'riftapp.hns'

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
        log('Skynet Provider: initializing')
        // load invisible iframe and define app's data domain
        // needed for permissions write
        console.log('Portal: ', portal)
        console.log('App domain: ', appDomain)
        log('App domain: ', appDomain)
        const _mySky = await client.loadMySky(appDomain, {
          // dev: true,
          // debug: true,
        })

        // Would these need to reinit if user changes?
        // Currently there is no way to switch users without a reload but
        // in the future this may need to be included in any reset process
        await _mySky.loadDacs(
          fileSystemDAC,
          feedDAC as any,
          // userProfileDAC as any,
          socialDAC as any
        )

        setMySky(_mySky)

        // check if user is already logged in with permissions
        const loggedIn = await _mySky.checkLogin()
        let userId = null
        if (loggedIn) {
          userId = await _mySky.userID()
          setMyUserId(userId)
        }

        generateApi({ userId, mySky: _mySky })

        setIsInitializing(false)
        log('Skynet Provider: done initializing')
      } catch (e) {
        log('Error', e)
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

      const isLoggingIn = await mySky.requestLoginAccess()

      if (isLoggingIn) {
        setIsReseting(true)

        // Initialization and cleanup functions from other services
        clearAllTokens(controlRef)
        clearEntriesBuffer()
        clearAllTaskQueues()

        const userId = await mySky.userID()
        setMyUserId(userId)
        generateApi({
          userId,
          mySky,
        })
        triggerToast(`Successfully logged in as ${userId.slice(0, 6)}...`)

        setIsReseting(false)
      }
    }
    func()
  }, [
    controlRef,
    isInitializing,
    mySky,
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

      // Initialization and cleanup functions from other services
      clearAllTokens(controlRef)
      clearEntriesBuffer()
      clearAllTaskQueues()

      window.location.href = '/'
    }
    func()
    // }, [mySky, setLoggedIn, setUserId, generateApi, setIsReseting])
  }, [controlRef, mySky, setIsReseting])

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

  const isReady = !!getKey([])

  const value = {
    isInitializing,
    isReseting,
    isReady,
    login,
    logout,
    mySky,
    myUserId,
    Api,
    getKey,
    identityKey,
    appDomain,
    controlRef,
  }

  return (
    <SkynetContext.Provider value={value}>{children}</SkynetContext.Provider>
  )
}

export { useControlRef } from './ref'
export type { ControlRefDefaults, ControlRef } from './ref'
export { apiLimiter, buildApi } from './api'
export type { Api } from './api'
