import { getPosts } from "./bot";
import { meta as metaReddit } from "./bot/reddit";
import { meta as metaCnn } from "./bot/cnn";
import { RssSourceMeta } from "./bot/rss";
import { Post } from "./bot/types";
import uniq from 'lodash/uniq';
import { writeContentRecordsToSkyDb } from "./skydb";

export type PostMap = { [id: string]: Post }

function includesTag(post: Post, tag: string) {
  if (!(post && post.content && post.content.tags)) {
    return false
  }
  return post.content.tags.includes(tag)
}

function getCount(posts: Post[], tag: string) {
  return `count: ${posts.reduce((acc, post) => includesTag(post, tag) ? acc + 1 : acc, 0)}`
}

function printSection(posts: Post[], meta: RssSourceMeta) {
  console.log(`\t${meta.name}`)
  let subset = posts.filter((post) => includesTag(post, meta.name))
  console.log(`\t\t${getCount(posts, meta.name)}`)

  meta.sections.map((section) => {
    console.log(`\t\t${section} ${getCount(subset, section)}`)
  })
  console.log('\n')
}

// Dedupe posts that already existed or exist across different rss feeds.
function updatePostMap(posts: Post[], map: PostMap) {
  posts.forEach((post) => {
    const existingPost = map[post.id]
    if (existingPost) {
      map[post.id] = {
        ...existingPost,
        ...post,
        content: {
          ...existingPost.content,
          ...post.content,
          tags: uniq([...(existingPost.content?.tags || []), ...(post.content?.tags || [])])
        }
      }
    } else {
      map[post.id] = post
    }
  })
}

export async function pullData(postMap: PostMap) {
  const posts = await getPosts()

  const newPostMap: PostMap = {}
  updatePostMap(posts, newPostMap)

  const newPosts: Post[] = Object.entries(newPostMap).map(([_key, post]) => post)
  console.log(`Data - ${new Date()}`)

  console.log(`\nNew`)
  console.log('\tHacker News')
  console.log(`\t\t${getCount(newPosts, 'hacker news')}`)

  printSection(newPosts, metaReddit)
  printSection(newPosts, metaCnn)

  updatePostMap(posts, postMap)

  const allPosts: Post[] = Object.entries(postMap).map(([_key, post]) => post)

  console.log(`\nTotal`)

  console.log('\tHacker News')
  console.log(`\t\t${getCount(allPosts, 'hacker news')}`)

  printSection(allPosts, metaReddit)
  printSection(allPosts, metaCnn)
}

async function main() {
  const postMap: PostMap = {}
  // setInterval(() => {
  //   pullData(postMap)
  // }, 60000)
  await pullData(postMap)
  await writeContentRecordsToSkyDb(postMap)
}

main()