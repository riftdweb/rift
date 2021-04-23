import { ProcessedPost, Post } from './types'
import { processPosts } from './processing'

type ScoreData = {
  keywords: {
    [keyword: string]: number
  }
  domains: {
    [domain: string]: number
  }
}

/*
Algorithm 
  Potential affinty metrics
  - Number of reactions? in network pos/neg?
  - Number of comments in network
  - Number of views in network
  - Number of releveant keywords

  - Author's profile score
    - common connection score 
    - Friend's past engagement on author's content
    - User's own past engagement on author's content
    - Friend's average time spent on author's content
    - User's own average time spent on author's content
*/

function rankPost(
  processedPost: Partial<ProcessedPost>,
  { keywords, domains }: ScoreData
): ProcessedPost {
  const titleKeywordStems = processedPost.nlp.data.keywords.map(
    (keyword) => keyword.stem
  )
  const hostname = new URL(processedPost.post.content.link).hostname

  // p: Number of points (like upvotes or likes)
  // c: Number of comments
  // v: Number of views
  // r: Number of relevant keywords
  // d: Prioritized web domain
  // t_c: Time since initial creation
  // t_i: Time since last interaction

  const p = 5
  const c = 5
  const v = 5
  const r_data = Object.entries(keywords).reduce(
    (acc, [keyword, count]) => {
      if (titleKeywordStems.includes(keyword.toLowerCase())) {
        return {
          totalScore: acc.totalScore + count,
          matchCount: acc.matchCount + 1,
          matchWords: acc.matchWords.concat(keyword.toLowerCase()),
        }
      }
      return acc
    },
    {
      matchCount: 0,
      totalScore: 0,
      matchWords: [],
    } as any
  )
  const r = r_data.matchCount > 0 ? r_data.totalScore : 0 // / r_data.matchCount : 0
  const d_data = Object.entries(domains).find(
    ([domain, count]) => hostname === domain
  )
  const d = d_data ? d_data[1] : 0
  const t_c = 5
  const t_i = 5

  const c_weight = 0.5
  const v_weight = 0.002
  const r_weight = 0.5
  const d_weight = 0.2

  const score =
    (p + c_weight * c + v_weight * v + r_weight * r + d_weight * d + 0.75) /
    (1 + Math.pow(t_c, 1.8) - Math.pow(t_c - t_i, 1.2))

  return {
    ...processedPost,
    score,
    scoreDetails: {
      relevancy: {
        points: p,
        comments: c_weight * c,
        views: v_weight * v,
        keywords: r_weight * r,
        keywordsList: r_data.matchWords,
        domain: d_weight * d,
      },
      decay: 1 + Math.pow(t_c, 1.8) - Math.pow(t_c - t_i, 1.2),
    },
  } as ProcessedPost
}

export async function rankPosts(
  posts: Post[],
  scoreData: ScoreData
): Promise<ProcessedPost[]> {
  let _posts = []
  _posts = await processPosts(posts)
  _posts = _posts.map((post) => rankPost(post, scoreData))
  _posts = _posts.sort((a, b) => (a.score < b.score ? 1 : -1))

  return _posts
}
