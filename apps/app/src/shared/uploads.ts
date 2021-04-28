import { Skyfile } from './types'

export const getSize = (skyfile: Skyfile) => {
  return skyfile.metadata.length
}
