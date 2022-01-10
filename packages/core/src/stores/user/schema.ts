import { IUser } from '@riftdweb/types'
import { RxJsonSchema } from 'rxdb'

export const schema: RxJsonSchema<IUser> = {
  title: 'user schema',
  description: 'describes a user',
  version: 0,
  keyCompression: true,
  primaryKey: 'userId',
  type: 'object',
  properties: {
    userId: {
      type: 'string',
    },
    username: {
      type: 'string',
    },
    profile: {
      type: 'object',
      properties: {
        updatedAt: { type: 'integer' },
        data: { type: 'object' },
      },
    },
    following: {
      type: 'object',
      properties: {
        updatedAt: { type: 'integer' },
        data: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
    followers: {
      type: 'object',
      properties: {
        updatedAt: { type: 'integer' },
        data: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
    relationship: {
      type: 'object',
      properties: {
        updatedAt: { type: 'integer' },
        data: {
          enum: ['friend', 'follower', 'following', 'none'],
        },
      },
    },
    feed: {
      type: 'object',
      properties: {
        updatedAt: { type: 'integer' },
        data: {
          type: 'object',
          properties: {
            count: {
              type: 'integer',
            },
          },
        },
      },
    },
    meta: {
      properties: {
        updatedAt: { type: 'integer' },
        data: {
          type: 'object',
          properties: {
            skapps: {
              type: 'object',
            },
          },
        },
      },
    },
    updatedAt: {
      type: 'integer',
    },
  },
  required: [
    'userId',
    'profile',
    'following',
    'followers',
    'relationship',
    'feed',
    'meta',
    'updatedAt',
  ],
}
