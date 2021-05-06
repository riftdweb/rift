import { Box, Button, Flex, Heading, Input } from '@riftdweb/design-system'
import { Post } from 'feed-dac-library/dist/cjs/skystandards'
import { useCallback, useState } from 'react'
import { contentRecord, feedDAC, useSkynet } from '../../hooks/skynet'

export function MySkyLearn() {
  const [skylink, setSkylink] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const { userId } = useSkynet()

  const recordNewContent = useCallback(() => {
    const func = async () => {
      return await contentRecord.recordNewContent({
        skylink,
        metadata: {},
      })
    }
    func()
  }, [skylink])

  const recordInteraction = useCallback(() => {
    const func = async () => {
      return await contentRecord.recordInteraction({
        skylink,
        metadata: { action: 'updatedColorOf' },
      })
    }
    func()
  }, [skylink])

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
      const feed = feedDAC.loadPostsForUser(userId)
      for await (let batch of feed) {
        console.log(batch)
        _posts = _posts.concat(batch)
      }
      console.log(_posts)
      setPosts(_posts)
    }
    func()
  }, [userId, setPosts])

  return (
    <Box>
      <Flex css={{ flexDirection: 'column', gap: '$2' }}>
        <Heading>Learning</Heading>
        <Input onChange={(e) => setSkylink(e.target.value)} />
        <Box css={{ p: '$2 0' }}>
          <Button onClick={() => recordNewContent()}>Record new content</Button>
          <Button onClick={() => recordInteraction()}>
            Record interaction
          </Button>
        </Box>
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
