import { Box, Button, Flex, Textarea } from '@riftdweb/design-system'
import { useEffect, useRef, useState } from 'react'
import { ControlsInactive } from './ControlsInactive'

export function Controls() {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const ref = useRef(null)

  useEffect(() => {
    if (isEditing && ref && ref.current) {
      ref.current.focus()
    }
  }, [ref, isEditing])

  return (
    <Flex css={{ flexDirection: 'column', gap: '$1' }}>
      {!isEditing && <ControlsInactive setEditing={() => setIsEditing(true)} />}
      {isEditing && (
        <Flex css={{ flexDirection: 'column', gap: '$1' }}>
          <Textarea ref={ref} placeholder="Whats on your mind?" />
          <Flex css={{ gap: '$1' }}>
            <Box css={{ flex: 1 }} />
            <Button variant="ghost" onClick={() => setIsEditing(!isEditing)}>
              Cancel
            </Button>
            <Button>Post</Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}
