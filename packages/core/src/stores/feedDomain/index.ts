import { RxCollection, RxDocument } from 'rxdb'
import { schema } from './schema'

export type IFeedDomain = {
  id: string
  value: number
}

export type IFeedDomainDoc = RxDocument<IFeedDomain, IFeedDomainMethods>

type IFeedDomainMethods = {}

const methods: IFeedDomainMethods = {}

type IFeedDomainStatic = {
  count: () => Promise<number>
}

const statics: IFeedDomainStatic = {
  count: async function (this: IFeedDomainCollection) {
    const results = await this.find().exec()
    return results.length
  },
}

export type IFeedDomainCollection = RxCollection<
  IFeedDomain,
  IFeedDomainMethods,
  IFeedDomainStatic
>

export const feedDomainStore = {
  schema,
  methods,
  statics,
}
