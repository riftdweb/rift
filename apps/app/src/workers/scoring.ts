import { processEntries } from './processing'
import { Entry } from '@riftdweb/types'

type ScoreData = {
  keywords: {
    [keyword: string]: number
  }
  domains: {
    [domain: string]: number
  }
}

const c_weight = 0.5
const v_weight = 0.002
const r_weight = 0.5
const d_weight = 0.2

function calculateSignal({ p, c, v, r, d }) {
  return p + c_weight * c + v_weight * v + r_weight * r + d_weight * d + 0.75
}

function calculateDecay({ t_c, t_i }) {
  return 1 / (1 + Math.pow(t_c, 1.9) - Math.pow(t_c - t_i, 1.3))
}

const time_increment = 1000 * 60 * 60 * 4

function calculateTimeDiff({ t, t_now }) {
  if (t_now < t) {
    return 0
  }
  return (t_now - t) / time_increment
}

function rank({ entry, t_now, p, c, v, r, d }) {
  const t_c = calculateTimeDiff({ t: entry.post.ts, t_now })
  const t_i = calculateTimeDiff({ t: entry.post.ts, t_now })

  const signal = calculateSignal({ p, c, v, r, d })
  const decay = calculateDecay({ t_c, t_i })

  return signal * decay
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

export function scoreEntry({
  entry,
  rankTime = new Date().getTime(),
  scoreData: { keywords, domains },
}: {
  entry: Entry
  rankTime?: number
  scoreData: ScoreData
}): Entry {
  const titleKeywordStems = entry.nlp.data.keywords.map(
    (keyword) => keyword.stem
  )
  const link = entry.post.content.link
  const hostname = link ? new URL(link).hostname : ''

  if (rankTime < entry.post.ts) {
    return {
      ...entry,
      score: 0,
    } as Entry
  }

  // p: Number of upvotes
  // c: Number of comments
  // v: Number of views
  // r: Number of relevant keywords
  // d: Prioritized web domain
  // t_c: Time since initial creation
  // t_i: Time since last interaction

  const p = 0
  const c = 0
  const v = 0
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
  const t_now = rankTime

  const output = rank({
    entry,
    t_now,
    p,
    c,
    v,
    r,
    d,
  })

  const t_c = calculateTimeDiff({ t: entry.post.ts, t_now })
  const t_i = calculateTimeDiff({ t: entry.post.ts, t_now })

  const decay = calculateDecay({ t_c, t_i })

  const score = Number((output * 100).toFixed(0))

  return {
    ...entry,
    score,
    scoreDetails: {
      signal: {
        points: p,
        comments: c_weight * c,
        views: v_weight * v,
        keywords: r_weight * r,
        keywordsList: r_data.matchWords,
        domain: d_weight * d,
      },
      decay,
    },
  } as Entry
}

export async function scoreEntries(
  entries: Entry[],
  scoreData: ScoreData
): Promise<Entry[]> {
  let _entries = []
  _entries = await processEntries(entries)
  _entries = _entries.map((entry) =>
    scoreEntry({
      entry,
      scoreData,
    })
  )
  _entries = _entries.sort((a, b) => (a.score < b.score ? 1 : -1))

  return _entries
}
