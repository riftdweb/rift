import { Box, Button, Flex, Heading, Input } from '@riftdweb/design-system'
import { Post } from 'feed-dac-library/dist/cjs/skystandards'
import { useCallback, useState } from 'react'
import { feedDAC, useSkynet } from '../../contexts/skynet'

export function MySkyLearn() {
  const [value, setValue] = useState<string>('')
  const { myUserId } = useSkynet()

  const createPost = useCallback(() => {
    const func = async () => {
      await feedDAC.createPost({
        text: value,
      })
      setValue('')
    }
    func()
  }, [value, setValue])

  const [posts, setPosts] = useState<Post[]>([])
  const fetchPosts = useCallback(() => {
    const func = async () => {
      let _posts = []
      const feed = feedDAC.loadPostsForUser(myUserId)
      for await (let batch of feed) {
        console.log(batch)
        _posts = _posts.concat(batch)
      }
      console.log(_posts)
      setPosts(_posts)
    }
    func()
  }, [myUserId, setPosts])

  return (
    <Box>
      <Flex css={{ flexDirection: 'column', gap: '$2' }}>
        <Heading>Learning</Heading>
        <Box>
          <Input onChange={(e) => setValue(e.target.value)} />
          <Box css={{ p: '$2 0' }}>
            <Button onClick={() => createPost()}>Create Post</Button>
          </Box>
        </Box>
      </Flex>
      <Button onClick={fetchPosts}>Fetch posts</Button>
      {posts.map((post) => (
        <Box>{post.content.text}</Box>
      ))}
    </Box>
  )
}
