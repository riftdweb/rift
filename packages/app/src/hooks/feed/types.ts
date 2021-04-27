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

export type ProcessedPost = {
  post: Post
  score: number
  scoreDetails: {
    signal: {}
    decay: number
  }
  nlp: {
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
}

export interface Post {
  skylink: string
  /**
   * Full ID of the post this posts is commenting on
   */
  commentTo?: string
  content?: PostContent
  /**
   * This ID MUST be unique on the page this post is on. For example, this post could have the
   * full id d448f1562c20dbafa42badd9f88560cd1adb2f177b30f0aa048cb243e55d37bd/feed/posts/1/5
   * (userId/structure/feedId/pageId/postId)
   */
  id: number
  /**
   * If this post is deleted
   */
  isDeleted?: boolean
  /**
   * User IDs of users being mentioned in this post (also used for comments)
   */
  mentions?: string[]
  /**
   * Multihash of the Canonical JSON (http://wiki.laptop.org/go/Canonical_JSON) string of the
   * post being reposted or commented on to prevent unexpected edits
   */
  parentHash?: string
  /**
   * Full ID of the post being reposted (If this key is present, this post is a repost and
   * does not need to contain a "content")
   */
  repostOf?: string

  /**
   * Unix timestamp (in millisecons) when this post was created/posted
   */
  ts: number
}

/**
 * The content of a post
 */
export interface PostContent {
  /**
   * Can be used by applications to add more metadata
   */
  ext?: { [key: string]: any }
  /**
   * List of media objects in a "gallery", can be show in a carousel or list
   * useful for app screenshots or galleries
   * NOT TO BE USED for something like music albums, because it prevents individual tracks
   * from being referenced, saved, rated, reposted...
   */
  gallery?: Media[]
  /**
   * Can be used as a link to a url referred by this post
   */
  link?: string
  /**
   * title of the url, only used for preview
   */
  linkTitle?: string
  /**
   * A media object can contain an image, video, audio or combination of all of them
   */
  media?: Media
  /**
   * Used for polls
   */
  pollOptions?: { [key: string]: string }
  /**
   * Defines special attributes of this post which have a special meaning which can be
   * interpreted by the application showing this post
   */
  tags?: string[]
  /**
   * Text content of the post or description
   */
  text?: string
  /**
   * The content type of text
   */
  textContentType?: string
  /**
   * higlighted and used as title of the post when available
   */
  title?: string
  /**
   * Can contain multiple topics (hashtags) this post fits into
   */
  topics?: string[]
}

/**
 * A media object (image, audio or video). More specific media formats should be listed
 * first
 *
 * A media object can contain an image, video, audio or combination of all of them
 */
export interface Media {
  /**
   * Aspect ratio of the image and/or video
   */
  aspectRatio?: number
  audio?: Audio[]
  /**
   * BlurHash of the image shown while loading or not shown due to tags (spoiler or nsfw)
   */
  blurHash?: string
  image?: Image[]
  /**
   * Duration of the audio or video in milliseconds
   */
  mediaDuration?: number
  video?: Video[]
}

/**
 * An available media format listed in a media object
 */
export interface Audio {
  /**
   * file extension of this media format
   */
  ext: string
  url: string
  /**
   * quality of the audio in kbps
   */
  abr?: string
  /**
   * audio codec used by this format
   */
  acodec?: string
}

/**
 * An available media format listed in a media object
 */
export interface Image {
  /**
   * file extension of this media format
   */
  ext: string
  url: string
  /**
   * Height of the image
   */
  h: number
  /**
   * Width of the image
   */
  w: number
}

/**
 * An available media format listed in a media object
 */
export interface Video {
  /**
   * file extension of this media format
   */
  ext: string
  url: string
  /**
   * Frames per second of this format
   */
  fps?: number
  /**
   * video codec used by this format
   */
  vcodec?: string
}
