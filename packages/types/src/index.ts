import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { Post } from 'feed-dac-library/dist/cjs/skystandards'

// The following is the Skynet Skyfile metadata structure
// Skyfile {
//   contentType: string
//   metadata: {
//     filename: string
//     length: number
//     subfiles: {
//       [filename: string]: {
//         contenttype: string
//         filename: string
//         len: number
//         offset: number
//       }
//     }
//   }
//   skylink: string
// }

export type Subfile = {
  contenttype: string
  filename: string
  len: number
  offset?: number
  // System File object present during the upload only
  fileHandle?: File
  path?: string
}

export type SubfileMap = {
  [filename: string]: Subfile
}

export type Skyfile = {
  contentType: string
  metadata: {
    filename: string
    length: number
    subfiles: SubfileMap
    lastModified?: string
    path?: string
  }
  skylink: string
  id: string
  isDirectory: boolean
  upload: {
    status: string
    uploadedAt?: string
    updatedAt?: string
    ingressPortals: string[]
    progress?: number
    error?: string
  }
  // System File object present during the upload only
  fileHandle?: File
}

export type DomainKey = {
  id: string
  key: string
}

// Domain is either a MySky domain or an explicit seed (keypair)
export type Domain = {
  id: string
  dataDomain?: string
  // seed is the actual master seed concatenated with the child seed
  seed?: string
  parentSeed?: string
  name?: string
  childSeed?: string
  addedAt: string
  keys: DomainKey[]
}

export type AppRevision = {
  skyfile: string
  addedAt: string
}

export type App = {
  id: string
  name: string
  hnsDomain: string
  description: string
  addedAt: number
  tags: string[]
  // Revision's Skyfile
  lockedOn?: string
  revisions: AppRevision[]
}

export type DnsEntry = {
  id: string
  name: string
  entryLink: string
  dataLink: string
  addedAt: number
  updatedAt: number
}

type Position = {
  end: { line: number; column: number; offset: number }
  start: { line: number; column: number; offset: number }
}

type Node = {
  type: string
  position: Position
  children?: Node[]
  value?: string
  data?: {
    partOfSpeech: string
  }
}

type Match = {
  index: number
  node: Node
  parent: Node
}

export type Entry = {
  id: string
  userId: string
  isPending?: boolean
  post: Post
  score?: number
  scoreDetails?: {
    signal: {}
    decay: number
  }
  nlp?: {
    contents: string
    data: {
      keywords: {
        matches: Match[]
        stem: string
        score: number
      }[]
      keyphrases: {
        matches: Match[]
        stems: string[]
        value: string
        score: number
        weight: number
      }[]
    }
  }
  local?: boolean
}

export type Activity = {
  id: string
  userId: string
  message: string
  at: number
}

export type Feed<T> = {
  updatedAt: number
  entries: T[]
  // The feed data does not exist yet on Skynet
  null?: boolean
}

export type EntryFeed = Feed<Entry>
export type ActivityFeed = Feed<Activity>

export type WorkerParams = {
  force?: boolean
  priority?: number
  delay?: number
  workflowId?: string
}

export type RelationshipType = 'friend' | 'follower' | 'following' | 'none'

export type IUser = {
  userId: string
  username?: string
  profile: {
    updatedAt: number
    data: IUserProfile
  }
  following: {
    updatedAt: number
    data: string[]
  }
  followers: {
    updatedAt: number
    data: string[]
  }
  relationship: {
    updatedAt: number
    data: RelationshipType
  }
  feed: {
    updatedAt: number
    data: {
      count: number
    }
    // Data is stored separately
  }
  meta: {
    updatedAt: number
    data: {
      skapps: Record<string, boolean>
    }
  }
  updatedAt: number
}

export type UsersMap = {
  updatedAt: number
  entries: Record<string, IUser>
}

export type JSONResponse<T> = {
  data: T | null
  dataLink: string | null
}
