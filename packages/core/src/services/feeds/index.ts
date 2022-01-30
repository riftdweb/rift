import { db } from '../../stores'
import { Entry } from '@riftdweb/types'
import { createLogger } from '@riftdweb/logger'
import { v4 as uuid } from 'uuid'
import { syncUserFeed } from '../syncUser/resources/feed'
import { feedDAC, getAccount, getAccount$ } from '../account'
import { combineLatest, concatMap, from, map } from 'rxjs'
import { generateActivity } from './generateActivity'

const log = createLogger('feed')

export function getFeed$(id: string) {
  return db.feedindex.findOne(id).$
}

export function getFeedEntries$(id: string) {
  return db.feedindex.findOne(id).$.pipe(
    concatMap((feed) => from(db.entry.findByIds(feed.entryIds))),
    map((val) => [...val.values()])
  )
}

export function getActivity$() {
  return combineLatest([getAccount$(), db.entry.find().$]).pipe(
    map(([account, entries]) => generateActivity(account.myUserId, entries))
  )
}

export async function incrementKeywords(keywords) {
  keywords.forEach(async (keyword) => {
    const doc = await db.feedkeyword.findOne(keyword).exec()
    if (doc) {
      await doc.atomicPatch({
        value: doc.value + 1,
      })
    } else {
      await db.feedkeyword.atomicUpsert({
        id: keyword,
        value: 1,
      })
    }
  })
}

export function setKeywordValue(keyword: string, value: number) {
  return db.feedkeyword.atomicUpsert({
    id: keyword,
    value,
  })
}

export function getKeywords$() {
  return db.feedkeyword.find().$
}

export async function incrementDomain(domain: string) {
  const doc = await db.feeddomain.findOne(domain).exec()
  if (doc) {
    await doc.atomicPatch({
      value: doc.value + 1,
    })
  } else {
    await db.feeddomain.atomicUpsert({
      id: domain,
      value: 1,
    })
  }
}

export async function decrementDomain(domain: string) {
  const doc = await db.feeddomain.findOne(domain).exec()
  if (doc) {
    await doc.atomicPatch({
      value: doc.value - 1,
    })
  } else {
    await db.feeddomain.atomicUpsert({
      id: domain,
      value: 1,
    })
  }
}

export function getDomains$() {
  return db.feeddomain.find().$
}

export async function createPost(text: string) {
  const localLog = log.createLogger('createPost')
  const { myUserId } = await getAccount()
  const cid = uuid()
  const pendingPost = ({
    id: cid,
    userId: myUserId,
    post: {
      // skystandards is number
      id: cid,
      content: {
        text,
      },
      ts: new Date().getTime(),
    },
    isPending: true,
  } as unknown) as Entry

  try {
    localLog('Optimistic updates')
    db.pendingEntry.atomicUpsert(pendingPost)

    localLog('Feed DAC createPost')
    // Create post
    await feedDAC.createPost({ text })

    localLog('Start user feed update')
    await syncUserFeed(myUserId, 4, 0)

    // setPendingUserEntries((entries) =>
    //   entries.map((entry) => ({
    //     ...entry,
    //     isPending: false,
    //   }))
    // )
  } catch (e) {
    localLog('Error', e)
    // If an error occurs, remove the pending entries
    // setPendingUserEntries((entries) =>
    //   entries.filter(
    //     (entry) => ((entry.post.id as unknown) as string) !== cid
    //   )
    // )
  }
}
