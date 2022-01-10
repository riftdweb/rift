import { RxCollection, RxDocument } from 'rxdb'
import { schema } from './schema'

export type IFeedKeyword = {
  id: string
  value: number
}

export type IFeedKeywordDoc = RxDocument<IFeedKeyword, IFeedKeywordMethods>

type IFeedKeywordMethods = {}

const methods: IFeedKeywordMethods = {}

type IFeedKeywordStatic = {
  count: () => Promise<number>
}

const statics: IFeedKeywordStatic = {
  count: async function (this: IFeedKeywordCollection) {
    const results = await this.find().exec()
    return results.length
  },
}

export type IFeedKeywordCollection = RxCollection<
  IFeedKeyword,
  IFeedKeywordMethods,
  IFeedKeywordStatic
>

export const feedKeywordStore = {
  schema,
  methods,
  statics,
}
