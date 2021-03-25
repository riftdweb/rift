import { useState, useCallback } from 'react'
import { Button, Input, ControlGroup } from '@modulz/design-system'
import uniq from 'lodash/uniq'
import { useSeedKeys } from '../../hooks/useSeedKeys'

export function AddKey({ seed }) {
  const [key, setKey] = useState<string>()
  const [_keys, saveKey] = useSeedKeys(seed)

  return (
    <ControlGroup css={{ margin: '$3 0' }}>
      <Input
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="Add a new or existing data key to track and edit the value" />
      <Button
        onClick={() => saveKey(key)}>Add Key</Button>
    </ControlGroup>
  )
}
