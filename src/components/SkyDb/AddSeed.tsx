import { Box, Button, ControlGroup, Input } from '@modulz/design-system'
import { Pencil2Icon } from '@radix-ui/react-icons'
import { useCallback, useState } from 'react'
import { useSeeds } from '../../hooks/useSeeds'

export function AddSeed() {
  const { addSeed } = useSeeds()
  const [newSeed, setNewSeed] = useState<string>()

  const saveSeed = useCallback(
    (e) => {
      e.preventDefault()

      if (!newSeed) {
        return
      }

      // @ts-ignore
      addSeed(newSeed)

      setNewSeed('')
    },
    [newSeed, setNewSeed, addSeed]
  )

  return (
    <form>
      <ControlGroup css={{ margin: '$3 0' }}>
        <Input
          value={newSeed}
          onChange={(e) => setNewSeed(e.target.value)}
          placeholder="Enter seed to track and manage data keys"
        />
        <Button onClick={saveSeed}>
          <Box
            css={{
              mr: '$1',
            }}
          >
            <Pencil2Icon />
          </Box>
          Add Seed
        </Button>
      </ControlGroup>
    </form>
  )
}
