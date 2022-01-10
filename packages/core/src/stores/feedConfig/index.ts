import { RxCollection, RxDocument } from 'rxdb'
import { schema } from './schema'

export type IFeedConfig = {
  id: string
  isVisibilityEnabled: boolean
}

export type IFeedConfigDoc = RxDocument<IFeedConfig, IFeedConfigMethods>

type IFeedConfigMethods = {}

const methods: IFeedConfigMethods = {}

type IFeedConfigStatic = {
  count: () => Promise<number>
}

const statics: IFeedConfigStatic = {
  count: async function (this: IFeedConfigCollection) {
    const results = await this.find().exec()
    return results.length
  },
}

export type IFeedConfigCollection = RxCollection<
  IFeedConfig,
  IFeedConfigMethods,
  IFeedConfigStatic
>

export const feedConfigStore = {
  schema,
  methods,
  statics,
}
