import { RxCollection, RxDocument } from 'rxdb'
import { schema } from './schema'

export type Loader = {
  id: string
  isLoading: boolean
}

export type ILoaderDoc = RxDocument<Loader, ILoaderMethods>

type ILoaderMethods = {}

const methods: ILoaderMethods = {}

type ILoaderStatic = {
  count: () => Promise<number>
}

const statics: ILoaderStatic = {
  count: async function (this: ILoaderCollection) {
    const results = await this.find().exec()
    return results.length
  },
}

export type ILoaderCollection = RxCollection<
  Loader,
  ILoaderMethods,
  ILoaderStatic
>

export const loaderStore = {
  schema,
  methods,
  statics,
}
