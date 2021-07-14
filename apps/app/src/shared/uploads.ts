import { Skyfile } from '@riftdweb/types'

export const getSize = (skyfile: Skyfile) => {
  return skyfile.metadata.length
}
