import { Box, Button, ControlGroup, Input } from '@modulz/design-system'
import { Pencil2Icon } from '@radix-ui/react-icons'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { useSeedKeys } from '../../hooks/useSeedKeys'

export function AddKey({ seed }) {
  const { push } = useRouter()
  const [newKey, setNewKey] = useState<string>()
  const { addKey } = useSeedKeys(seed)

  const saveKey = useCallback((e) => {
    e.preventDefault()

    if (!newKey) {
      return
    }

    addKey(newKey)

    setNewKey('')

    push(`/skydb/${seed}/${newKey}`)
  }, [push, seed, newKey, setNewKey, addKey])

  return (
    <form>
      <ControlGroup css={{ margin: '$3 0' }}>
        <Input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Add a new or existing data key to track and edit the value" />
        <Button
          onClick={saveKey}>
          <Box
            css={{
              mr: '$1',
            }}>
            <Pencil2Icon />
          </Box>
          Add Key
        </Button>
      </ControlGroup>
    </form>
  )
}
