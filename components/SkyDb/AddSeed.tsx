import { useState, useCallback } from 'react'
import { Button, Input, ControlGroup } from '@modulz/design-system'
import uniq from 'lodash/uniq'
import { useSeeds } from '../../hooks/useSeeds'

export function AddSeed() {
  const [seeds, addSeed] = useSeeds()
  const [newSeed, setNewSeed] = useState<string>();

  const saveSeed = useCallback((e) => {
    e.preventDefault()

    if (!newSeed) {
      return
    }

    addSeed(newSeed)

    setNewSeed('')
  }, [newSeed, setNewSeed, addSeed])

  return (
      <form>
    <ControlGroup css={{ margin: '$3 0' }}>
        <Input
          value={newSeed}
          onChange={(e) => setNewSeed(e.target.value)}
          placeholder="Enter seed to track and manage data keys" />
        <Button
          onSubmit={saveSeed}
          onClick={saveSeed}>Add Seed</Button>
    </ControlGroup>
      </form>
  )
}
