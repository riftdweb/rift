import { db } from '../../stores'
import { Entry } from '@riftdweb/types'
import { createLogger } from '@riftdweb/logger'
import { v4 as uuid } from 'uuid'
import { syncUserFeed } from '../syncUser/resources/feed'
import { feedDAC, getAccount } from '../account'

const log = createLogger('feed')

export async function getFeedEntries(id: string) {
  const feed = await db.feedIndex.findOne(id).exec()
  const entries = await db.entry.findByIds(feed.entryIds)
  const list = []
  entries.forEach((entry) => {
    list.push(entry)
  })
  return list
}

// const activity = useFeedActivity({ ref })
// const top = useFeedTop({ ref })
// const latest = useFeedLatest({ ref, pendingUserEntries })
// const user = useFeedUser({ ref, pendingUserEntries, setPendingUserEntries })

export async function incrementKeywords(keywords) {
  keywords.forEach(async (keyword) => {
    const doc = await db.feedKeyword.findOne(keyword).exec()
    if (doc) {
      await doc.atomicPatch({
        value: doc.value + 1,
      })
    } else {
      await db.feedKeyword.atomicUpsert({
        id: keyword,
        value: 1,
      })
    }
  })
}

export function setKeywordValue(keyword: string, value: number) {
  return db.feedKeyword.atomicUpsert({
    id: keyword,
    value,
  })
}

export async function incrementDomain(domain: string) {
  const doc = await db.feedDomain.findOne(domain).exec()
  if (doc) {
    await doc.atomicPatch({
      value: doc.value + 1,
    })
  } else {
    await db.feedDomain.atomicUpsert({
      id: domain,
      value: 1,
    })
  }
}

export async function decrementDomain(domain: string) {
  const doc = await db.feedDomain.findOne(domain).exec()
  if (doc) {
    await doc.atomicPatch({
      value: doc.value - 1,
    })
  } else {
    await db.feedDomain.atomicUpsert({
      id: domain,
      value: 1,
    })
  }
}

export async function createPost(text: string) {
  const localLog = log.createLogger('createPost')
  const { myUserId } = await getAccount().exec()
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
