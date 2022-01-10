import { Entry } from '@riftdweb/types'
import { RxCollection, RxDocument } from 'rxdb'
import { schema } from './schema'

export type IEntryDoc = RxDocument<Entry, IEntryMethods>

type IEntryMethods = {}

const methods: IEntryMethods = {}

type IEntryStatic = {
  count: () => Promise<number>
}

const statics: IEntryStatic = {
  count: async function (this: IEntryCollection) {
    const results = await this.find().exec()
    return results.length
  },
}

export type IEntryCollection = RxCollection<Entry, IEntryMethods, IEntryStatic>

export const entryStore = {
  schema,
  methods,
  statics,
}

export type { Entry }
