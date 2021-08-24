import { IUser } from '@riftdweb/types'

export function buildUser(userId: string): IUser {
  return {
    userId,
    relationship: {
      updatedAt: 0,
      data: 'none',
    },
    profile: {
      updatedAt: 0,
      data: {
        version: 1,
        username: '',
      },
    },
    following: {
      updatedAt: 0,
      data: [],
    },
    followers: {
      updatedAt: 0,
      data: [],
    },
    feed: {
      updatedAt: 0,
      data: {
        count: -1,
      },
    },
    meta: {
      updatedAt: 0,
      data: {
        skapps: {},
      },
    },
    updatedAt: 0,
  }
}
