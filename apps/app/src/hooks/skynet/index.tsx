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
import { FeedDAC } from 'feed-dac-library'
import { UserProfileDAC } from '@skynethub/userprofile-library'
import { SocialDAC } from 'social-dac-library'
import { globals } from '../../shared/globals'
import { useProfile } from '../useProfile'
import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { ControlRef, useControlRef } from './useControlRef'

export const feedDAC = new FeedDAC()
export const contentRecord = new ContentRecordDAC()
export const userProfileDAC = new UserProfileDAC()
export const socialDAC = new SocialDAC()

type State = {
  isInitializing: boolean
  isReseting: boolean
  myProfile: IUserProfile
  Api: ReturnType<typeof buildApi>
  getKey: (resourceKeys: string[]) => string[] | null
  mySky: MySky
  loggedIn: boolean
  userId: string
  dataDomain: string
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
  const [portal] = useSelectedPortal()
  const controlRef = useControlRef()
  const { localRootSeed } = useLocalRootSeed()

  const [isInitializing, setIsInitializing] = useState<boolean>(true)
  const [isReseting, setIsReseting] = useState<boolean>(false)
  const [userId, _setUserId] = useState<string>()
  const setUserId = useCallback(
    (userId: string) => {
      controlRef.current.userId = userId
      _setUserId(userId)
    },
    [_setUserId]
  )
  const [Api, setApi] = useState<ReturnType<typeof buildApi>>()
  const myProfile = useProfile(userId)
  const [mySky, setMySky] = useState<MySky>()
  const [loggedIn, setLoggedIn] = useState(null)

  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  const parts = hostname.split('.')
  const subdomain = parts.slice(0, parts.length - 2).join('.')
  const dataDomain = subdomain || 'localhost'

  // When portal changes rebuild client
  const client = useMemo(() => new SkynetClient(`https://${portal}`), [portal])

  const generateApi = useCallback(
    ({ userId, mySky }: { userId: string; mySky: any }) => {
      const api = buildApi({
        portal,
        localRootSeed,
        dataDomain,
        // passed params to ensure latest value
        mySky,
        userId,
      })
      controlRef.current.Api = api
      setApi(api)
    },
    [portal, localRootSeed, dataDomain, setApi]
  )

  // On app init set up MySky
  useEffect(() => {
    const func = async () => {
      try {
        console.log('Skynet Provider: initializing')
        // load invisible iframe and define app's data domain
        // needed for permissions write
        console.log('App domain: ', dataDomain)
        const _mySky = await client.loadMySky(dataDomain, {
          // dev: true,
          // debug: true,
        })
        // load necessary DACs and permissions
        await _mySky.loadDacs(
          contentRecord as any,
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
          setUserId(userId)
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
        setUserId(userId)
        generateApi({
          userId,
          mySky,
        })
        triggerToast(`Successfully logged in as ${userId.slice(0, 6)}...`)
      }
      setIsReseting(false)
    }
    func()
  }, [
    isInitializing,
    mySky,
    setLoggedIn,
    setUserId,
    generateApi,
    setIsReseting,
  ])

  const logout = useCallback(() => {
    const func = async () => {
      setIsReseting(true)
      await mySky.logout()

      setLoggedIn(false)
      setUserId('')
      generateApi({
        userId: null,
        mySky,
      })
      setIsReseting(false)
    }
    func()
  }, [mySky, setLoggedIn, setUserId, generateApi, setIsReseting])

  // Key that can be used for SWR revalidation when identity changes
  const identityKey = userId ? userId : localRootSeed

  // Method for getting a namespaced SWR key
  const getKey = useMemo(() => {
    return (keys: string[]) => {
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
    userId,
    Api,
    getKey,
    identityKey,
    dataDomain,
    myProfile,
    controlRef,
  }

  return (
    <SkynetContext.Provider value={value}>{children}</SkynetContext.Provider>
  )
}
