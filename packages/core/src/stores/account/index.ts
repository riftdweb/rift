import { RxCollection, RxDocument, RxQuery } from 'rxdb'
import { IAccount, schema } from './schema'

export const configKey = 'v1'

export type IAccountDoc = RxDocument<IAccount, IAccountMethods>

export type IAccountMethods = {}

const methods: IAccountMethods = {}

type IAccountStatics = {}

const statics: IAccountStatics = {}

export type IAccountCollection = RxCollection<
  IAccount,
  IAccountMethods,
  IAccountStatics
>

export const accountStore = {
  schema,
  methods,
  statics,
}

export type { IAccount }
