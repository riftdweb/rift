import { Story } from '.'

export async function getStoriesHn(): Promise<Story[]> {
  const ls = localStorage.getItem('hn')

  if (ls) {
    return JSON.parse(ls)
  }

  const response = await fetch(
    'https://hacker-news.firebaseio.com/v0/newstories.json'
  )
  const stories = await response.json()

  const promises = stories.map(async (id) => {
    const response = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`
    )
    return await response.json()
  })
  const _results: Partial<Story>[] = await Promise.all(promises)
  const results = _results.map((result) => ({
    ...result,
    time: result.time * 1000,
    tags: ['hacker news'],
  })) as Story[]

  localStorage.setItem('hn', JSON.stringify(results))

  return results
}
