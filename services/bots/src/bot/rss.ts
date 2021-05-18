import parser from 'xml2json'
import { Story } from '.'

export type RssSourceMeta = {
  name: string
  baseUrl: string
  dataPath: string[]
  sections: string[]
}

export function rssToJson(data: any) {
  const json = parser.toJson(data) as any
  return JSON.parse(json)
}

async function getSection<T>(meta: RssSourceMeta, section: string): Promise<T[]> {
  const response = await fetch(
    `${meta.baseUrl}${section}.rss`
  )
  const xml = await response.text()
  const json = rssToJson(xml) as any

  let data: any = json
  for (let key of meta.dataPath) {
    data = data[key]
  }

  if (!Array.isArray(data)) {
    data = [data]
  }

  return data as T[]
}

type EntriesToStories<T> = (entries: T[], meta: RssSourceMeta, section: string) => Story[]

export async function getStories<T>(meta: RssSourceMeta, entriesToStories: EntriesToStories<T>): Promise<Story[]> {
  let results: Story[] = []

  for await (let section of meta.sections) {
    const items = await getSection<T>(meta, section)
    results = results.concat(entriesToStories(items, meta, section))
  }

  return results
}
