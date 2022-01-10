import { FeedIndex } from '@riftdweb/types'
import { RxJsonSchema } from 'rxdb'

export const schema: RxJsonSchema<FeedIndex> = {
  title: 'feed index schema',
  description: 'describes a feed index',
  version: 0,
  keyCompression: true,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    entryIds: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    updatedAt: {
      type: 'integer',
    },
  },
  required: ['id', 'name', 'entryIds', 'updatedAt'],
}
