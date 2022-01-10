import { Entry } from '@riftdweb/types'
import { RxJsonSchema } from 'rxdb'

export const schema: RxJsonSchema<Entry> = {
  title: 'entry schema',
  description: 'describes an entry',
  version: 0,
  keyCompression: true,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    userId: {
      type: 'string',
    },
    isPending: {
      type: 'boolean',
    },
    post: {
      type: 'object',
    },
    score: {
      type: 'number',
    },
    scoreDetails: {
      type: 'object',
    },
    nlp: {
      type: 'object',
    },
    local: {
      type: 'boolean',
    },
  },
  required: ['id', 'userId', 'post'],
}
