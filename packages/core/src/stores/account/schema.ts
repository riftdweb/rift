import { RxJsonSchema } from 'rxdb'

export type IAccount = {
  id: string
  isReady: boolean
  isInitializing: boolean
  isReseting: boolean
  myUserId: string
  appDomain: string
  identityKey: string
  portal: string
  localRootSeed: string
}

export const schema: RxJsonSchema<IAccount> = {
  title: 'skynet schema',
  description: 'describes skynet state',
  version: 0,
  keyCompression: true,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    isReady: {
      type: 'boolean',
    },
    isInitializing: {
      type: 'boolean',
    },
    isReseting: {
      type: 'boolean',
    },
    myUserId: {
      type: 'string',
    },
    appDomain: {
      type: 'string',
    },
    identityKey: {
      type: 'string',
    },
    portal: {
      type: 'string',
    },
    localRootSeed: {
      type: 'string',
    },
  },
  required: [
    'id',
    'isReady',
    'isInitializing',
    'isReseting',
    'myUserId',
    'appDomain',
    'identityKey',
    'portal',
    'localRootSeed',
  ],
}
