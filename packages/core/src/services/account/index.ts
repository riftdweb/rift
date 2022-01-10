import { createLogger } from '@riftdweb/logger'
import { MySky, SkynetClient } from 'skynet-js'
import { db } from '../../stores'
import { triggerToast } from '../../..'
import { configKey } from '../../stores/account'
import { buildApi } from './api'

const log = createLogger('rx/account')

export const fileSystemDAC = {} as any
export const feedDAC = {} as any
export const socialDAC = {} as any

let mySky: MySky = null
export type IApi = ReturnType<typeof buildApi>
export let Api: IApi = null
let client: SkynetClient = null

const state = {
  mySky,
  Api,
  client,
}
// @ts-ignore
window.account = state

export async function initSkynetService() {
  let config = await db.account.findOne(configKey).exec()
  if (!config) {
    const hostname =
      typeof window !== 'undefined' ? window.location.hostname : ''
    const appDomain = hostname === 'localhost' ? 'localhost' : 'riftapp.hns'
    const portal = 'siasky.net'
    config = await db.account.insert({
      id: configKey,
      isReady: false,
      isInitializing: true,
      isReseting: false,
      myUserId: '',
      appDomain,
      portal,
      // localRootSeed: String(Math.random()),
    })
    log('Not found, initialized', config.toJSON())
  } else {
    log('Found', config.toJSON())
  }

  const { portal } = config
  state.client = new SkynetClient(`https://${portal}`)

  await initSkynet()
}

// // When portal changes rebuild client

async function generateApi() {
  const { localRootSeed, appDomain, myUserId } = await db.account
    .findOne(configKey)
    .exec()

  const api = buildApi({
    localRootSeed,
    client: state.client,
    appDomain,
    // passed params to ensure latest value
    mySky: state.mySky,
    userId: myUserId,
  })

  state.Api = api
}

async function initSkynet() {
  const config = await db.account.findOne(configKey).exec()

  const { portal, appDomain } = config

  try {
    log('Skynet initializing')
    console.log('Portal: ', portal)
    console.log('App domain: ', appDomain)
    log('App domain: ', appDomain)

    state.mySky = await state.client.loadMySky(appDomain, {
      // dev: true,
      // debug: true,
    })

    // Would these need to reinit if user changes?
    // Currently there is no way to switch users without a reload but
    // in the future this may need to be included in any reset process
    await mySky
      .loadDacs
      // fileSystemDAC,
      // feedDAC as any,
      // // userProfileDAC as any,
      // socialDAC as any
      ()

    // check if user is already logged in with permissions
    const loggedIn = await state.mySky.checkLogin()
    let userId = null
    if (loggedIn) {
      userId = await state.mySky.userID()

      await config.atomicPatch({
        myUserId: userId,
      })
    }

    await generateApi()

    await config.atomicPatch({
      isInitializing: false,
    })

    log('Done initializing')
  } catch (e) {
    log('Error', e)
  }
}

export async function login() {
  const config = await db.account.findOne(configKey).exec()

  if (config.isInitializing) {
    return
  }

  const isLoggingIn = await state.mySky.requestLoginAccess()

  if (isLoggingIn) {
    await config.atomicPatch({
      isReseting: true,
    })

    // Initialization and cleanup functions from other services
    // clearAllTokens(controlRef)
    // clearEntriesBuffer()
    // clearAllTaskQueues()

    const userId = await state.mySky.userID()

    await config.atomicPatch({
      myUserId: userId,
    })

    await generateApi()

    triggerToast(`Successfully logged in as ${userId.slice(0, 6)}...`)

    await config.atomicPatch({
      isReseting: false,
    })
  }
}

export async function logout() {
  const config = await db.account.findOne(configKey).exec()

  await config.atomicPatch({
    isReseting: true,
  })

  await state.mySky.logout()

  await config.atomicPatch({
    isReady: false,
    isInitializing: false,
    myUserId: '',
  })

  await generateApi()

  await config.atomicPatch({
    isReseting: false,
  })

  // Initialization and cleanup functions from other services
  // clearAllTokens(controlRef)
  // clearEntriesBuffer()
  // clearAllTaskQueues()

  // window.location.href = '/'
}

export function getAccount() {
  return db.account.findOne(configKey)
}
