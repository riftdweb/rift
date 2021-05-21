import { Box, Button, Flex, Textarea } from '@riftdweb/design-system'
import { useEffect, useRef, useState } from 'react'
import { useFeed } from '../../../hooks/feed'
import { logger } from '../../../shared/logger'
import { ControlsInactive } from './ControlsInactive'

function log(...args) {
  logger('Controls', ...args)
}

export function Controls() {
  const { createPost } = useFeed()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [value, setValue] = useState<string>('')
  const ref = useRef(null)

  useEffect(() => {
    if (isEditing && ref && ref.current) {
      ref.current.focus()
    }
  }, [ref, isEditing])

  log(value)

  return (
    <Flex css={{ flexDirection: 'column', gap: '$1', paddingBottom: '$3' }}>
      {!isEditing && <ControlsInactive setEditing={() => setIsEditing(true)} />}
      {isEditing && (
        <Flex css={{ flexDirection: 'column', gap: '$2' }}>
          <Textarea
            ref={ref}
            placeholder="Whats on your mind?"
            onChange={(e) => setValue(e.target.value)}
          />
          <Flex css={{ gap: '$1' }}>
            <Box css={{ flex: 1 }} />
            <Button variant="ghost" onClick={() => setIsEditing(!isEditing)}>
              Cancel
            </Button>
            <Button onClick={() => createPost({ text: value })}>Post</Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}
