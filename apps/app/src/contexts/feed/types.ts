import { Post } from 'feed-dac-library/dist/cjs/skystandards'

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
  prioritize?: boolean
  delay?: number
  workflowId?: string
}
