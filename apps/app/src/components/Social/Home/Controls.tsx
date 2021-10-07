import { Box, Button, Flex, Textarea } from '@riftdweb/design-system'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFeed, useSkynet } from '@riftdweb/core'
import { ControlsInactive } from './ControlsInactive'

export function Controls() {
  const { myUserId, login } = useSkynet()
  const { createPost, setMode } = useFeed()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [value, setValue] = useState<string>('')
  const ref = useRef(null)

  const createPostAndNavigate = useCallback(
    (value: string) => {
      createPost({ text: value })
      setMode('latest')
      setIsEditing(false)
    },
    [createPost, setMode, setIsEditing]
  )

  useEffect(() => {
    if (isEditing && ref && ref.current) {
      ref.current.focus()
    }
  }, [ref, isEditing])

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
            {myUserId ? (
              <Button onClick={() => createPostAndNavigate(value)}>Post</Button>
            ) : (
              <Button onClick={() => login()}>
                Log in with Skynet to post
              </Button>
            )}
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}
