// import * as CAF from 'caf'
// import { createLogger } from '../../shared/logger'
// import { ControlRef } from '../skynet/useControlRef'
// import { fetchAllEntries, needsRefresh } from './shared'
// import { workerFeedUserUpdate } from '../../workers/workerFeedUser'
// import { EntryFeed, WorkerParams } from './types'
// import { clearAllTokens, clearToken, handleToken } from './tokens'
// import { wait } from '../../shared/wait'
// import { socialDAC } from '../skynet'
// import { itemCss } from '@riftdweb/design-system/src/components/Menu'
// import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
// import { fetchProfile } from '../useProfile'

// const SCHEDULE_INTERVAL_CRAWLER = 1000 * 60 * 5
// const FALSE_START_WAIT_INTERVAL = 1000 * 2
// const REFRESH_INTERVAL_CRAWLER = 0

// const log = createLogger('crawler/network')
// const cafCrawlerNetwork = CAF(function* crawlerNetwork(
//   signal: any,
//   ref: ControlRef,
//   params: WorkerParams
// ): Generator<Promise<EntryFeed | string[] | void>, any, any> {
//   let promises = []
//   try {
//     log('Running')
//     // const myUserId = ref.current.myUserId

//     log('Fetching following lists')
//     let pendingUserIds = new Set<string>(
//       ref.current.followingUserIds.data || []
//     )
//     let processedUserIds = new Set<string>([])

//     type UserItem = {
//       userId: string
//       username?: string
//       profile?: IUserProfile
//       followingIds: Set<string>
//       followerIds: Set<string>
//     }

//     let allUserItems = new Map<string, UserItem>()

//     while (pendingUserIds.size) {
//       promises = [...pendingUserIds.values()].map(async (userId) => {
//         const existingUserItem = allUserItems.get(userId)

//         if (!existingUserItem) {
//           const _followingIds = await socialDAC.getFollowingForUser(userId)
//           const followingIds = new Set<string>(_followingIds)
//           const profile = await fetchProfile(ref, userId)

//           return {
//             userId,
//             username: profile.username,
//             profile: profile,
//             followingIds,
//             followerIds: [],
//           }
//         } else {
//           return {
//             ...existingUserItem,
//             followerIds: [],
//           }
//         }
//       })
//       const newUserItems: UserItem[] = yield Promise.all(promises)

//       processedUserIds.concat(pendingUserIds)
//       pendingUserIds = []

//       log('Added', newUserItems)
//       newUserItems.forEach((newItem) => {
//         if (!allUserItems.get(newItem.userId)) {
//           allUserItems.set(newItem.userId, newItem)
//         }
//         newItem.followingIds.forEach((userId) => {
//           if (!processedUserIds.includes(userId)) {
//             log(`Adding ${userId} for processing`)
//             pendingUserIds.push(userId)
//           }
//         })
//       })
//     }

//     log('Done', allUserItems)

//     log('Returning')
//     return
//   } finally {
//     log('Finally')
//     if (signal.aborted) {
//       log('Aborted')
//     }
//   }
// })

// export async function workerCrawlerNetwork(
//   ref: ControlRef,
//   params: WorkerParams = {}
// ): Promise<any> {
//   const token = await handleToken(ref, 'crawlerNetwork')
//   try {
//     await cafCrawlerNetwork(token.signal, ref, params)
//   } catch (e) {
//     log(e)
//   } finally {
//     clearToken(ref, 'crawlerNetwork')
//   }
// }

// const logScheduler = createLogger('crawler/network/schedule')

// async function maybeRunCrawlerNetwork(ref: ControlRef): Promise<any> {
//   // If crawler is already running skip
//   if (!ref.current.followingUserIdsHasFetched) {
//     logScheduler(
//       `Follower list not ready, trying again in ${
//         FALSE_START_WAIT_INTERVAL / 1000
//       } seconds`
//     )
//     setTimeout(() => {
//       maybeRunCrawlerNetwork(ref)
//     }, FALSE_START_WAIT_INTERVAL)
//   }
//   // If crawler is already running skip
//   else if (ref.current.tokens.crawlerUsers) {
//     logScheduler(`Crawler already running, skipping`)
//   } else {
//     logScheduler(`Crawler starting`)
//     workerCrawlerNetwork(ref)
//   }
// }

// let interval = null

// export async function scheduleCrawlerNetwork(ref: ControlRef): Promise<any> {
//   log('Starting scheduler')

//   // Give the page render requests a few seconds to complete
//   await wait(3000)

//   maybeRunCrawlerNetwork(ref)

//   clearInterval(interval)
//   interval = setInterval(() => {
//     maybeRunCrawlerNetwork(ref)
//   }, SCHEDULE_INTERVAL_CRAWLER)
// }

export const i = 0
