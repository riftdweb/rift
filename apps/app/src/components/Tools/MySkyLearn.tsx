import { Box, Button, Flex, Heading, Input } from '@riftdweb/design-system'
import { useCallback, useState } from 'react'
import { contentRecord } from '../../hooks/skynet'

export function MySkyLearn() {
  const [skylink, setSkylink] = useState<string>('')

  const recordNewContent = useCallback((skylink: string) => {
    const func = async () => {
      await contentRecord.recordNewContent({
        skylink,
        metadata: {},
      })
    }
    func()
  }, [])

  const recordInteraction = useCallback((skylink: string) => {
    const func = async () => {
      await contentRecord.recordInteraction({
        skylink,
        metadata: { action: 'updatedColorOf' },
      })
    }
    func()
  }, [])

  return (
    <Box>
      <Flex css={{ flexDirection: 'column', gap: '$2' }}>
        <Heading>Learning</Heading>
        <Input onChange={(e) => setSkylink(e.target.value)} />
        <Box css={{ p: '$2 0' }}>
          <Button onClick={() => recordNewContent(skylink)}>
            Record new content
          </Button>
          <Button onClick={() => recordInteraction(skylink)}>
            Record interaction
          </Button>
        </Box>
      </Flex>
    </Box>
  )
}
