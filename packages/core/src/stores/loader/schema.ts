import { RxJsonSchema } from 'rxdb'
import { Loader } from '.'

export const schema: RxJsonSchema<Loader> = {
  title: 'loader schema',
  description: 'describes a loader',
  version: 0,
  keyCompression: true,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    isLoading: {
      type: 'boolean',
    },
  },
  required: ['id', 'isLoading'],
}
