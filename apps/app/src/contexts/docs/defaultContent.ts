import times from 'lodash/times'
import { DocData } from '.'

export const defaultContent: DocData = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Welcome to your new page' }],
    },
    ...times(10, () => ({
      type: 'paragraph',
    })),
  ],
}
