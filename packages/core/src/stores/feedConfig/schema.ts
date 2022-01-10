import { RxJsonSchema } from 'rxdb'
import { IFeedConfig } from '.'

export const schema: RxJsonSchema<IFeedConfig> = {
  title: 'feed config schema',
  description: 'describes a feed config',
  version: 0,
  keyCompression: true,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    isVisibilityEnabled: {
      type: 'boolean',
    },
  },
  required: ['id', 'isVisibilityEnabled'],
}
