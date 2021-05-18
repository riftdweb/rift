import { Story } from '.'

export async function getStoriesHn(): Promise<Story[]> {
  let _results: Partial<Story>[] = []

  try {
    const response = await fetch(
      'https://hacker-news.firebaseio.com/v0/topstories.json'
    )
    const stories = await response.json()

    const promises = stories.map(async (id: string) => {
      const response = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      )
      return await response.json()
    })

    _results = await Promise.all(promises)
  } catch(e) {
    // Sometimes the API rejects the request
    return []
  }

  const results = _results.map((result) => ({
    ...result,
    time: result.time as number * 1000,
    tags: ['hacker news'],
  })) as Story[]

  return results
}
