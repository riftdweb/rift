import { RxJsonSchema } from 'rxdb'
import { IFeedDomain } from '.'

export const schema: RxJsonSchema<IFeedDomain> = {
  title: 'feed domain schema',
  description: 'describes a feed domain',
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
