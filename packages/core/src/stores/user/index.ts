import { IUser } from '@riftdweb/types'
import { RxCollection, RxDocument } from 'rxdb'
import { schema } from './schema'

export type IUserDoc = RxDocument<IUser, IUserMethods>

type IUserMethods = {
  scream: (v: string) => string
}

const methods: IUserMethods = {
  scream: function (this: IUserDoc, what: string) {
    return this.userId + ' screams: ' + what.toUpperCase()
  },
}

type IUserStatic = {
  count: () => Promise<number>
}

const statics: IUserStatic = {
  count: async function (this: IUserCollection) {
    const results = await this.find().exec()
    return results.length
  },
}

export type IUserCollection = RxCollection<IUser, IUserMethods, IUserStatic>

export const userStore = {
  schema,
  methods,
  statics,
}

export type { IUser }
