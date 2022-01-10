import { FeedIndex } from '@riftdweb/types'
import { RxCollection, RxDocument } from 'rxdb'
import { schema } from './schema'

export type IFeedIndexDoc = RxDocument<FeedIndex, IFeedIndexMethods>

type IFeedIndexMethods = {}

const methods: IFeedIndexMethods = {}

type IFeedIndexStatic = {
  count: () => Promise<number>
}

const statics: IFeedIndexStatic = {
  count: async function (this: IFeedIndexCollection) {
    const results = await this.find().exec()
    return results.length
  },
}

export type IFeedIndexCollection = RxCollection<
  FeedIndex,
  IFeedIndexMethods,
  IFeedIndexStatic
>

export const feedStore = {
  schema,
  methods,
  statics,
}

export type { FeedIndex }
