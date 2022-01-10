import { RxJsonSchema } from 'rxdb'
import { IFeedKeyword } from '.'

export const schema: RxJsonSchema<IFeedKeyword> = {
  title: 'keyword schema',
  description: 'describes a keyword',
  version: 0,
  keyCompression: true,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    value: {
      type: 'integer',
    },
  },
  required: ['id', 'value'],
}
