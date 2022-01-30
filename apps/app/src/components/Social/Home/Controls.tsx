import { Box, Button, Flex, TextArea } from '@riftdweb/design-system'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ControlsInactive } from './ControlsInactive'
import { useAccount } from '@riftdweb/core/src/hooks/useAccount'
import { login } from '@riftdweb/core/src/services/account'
import { createPost } from '@riftdweb/core/src/services/feeds'

export function Controls() {
  const { myUserId } = useAccount()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [value, setValue] = useState<string>('')
  const ref = useRef(null)

  const createPostAndNavigate = useCallback(
    (value: string) => {
      createPost(value)
      // setMode('latest')
      setIsEditing(false)
    },
    [setIsEditing]
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
          <TextArea
            ref={ref}
            placeholder="Whats on your mind?"
            onChange={(e) => setValue(e.target.value)}
          />
          <Flex css={{ gap: '$1' }}>
            <Box css={{ flex: 1 }} />
            <Button ghost onClick={() => setIsEditing(!isEditing)}>
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
