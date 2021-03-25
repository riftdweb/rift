import { Button, ControlGroup, Tooltip } from '@modulz/design-system'
import { ReloadIcon } from '@radix-ui/react-icons'
import SpinnerIcon from '../_icons/SpinnerIcon'

type Props = {
  isFetching: boolean
  refreshKey: () => void
  saveChanges: () => void
  removeKey: (key: string) => void
}

export function KeysToolbar({ saveChanges, refreshKey, removeKey, isFetching }: Props) {
  return (
    <ControlGroup
            css={{ margin: '$2 0' }}
    >
      <Button
        disabled={isFetching}
        onClick={refreshKey}>
        {isFetching ?
          <SpinnerIcon />
          : <ReloadIcon />
        }
      </Button>
      <Tooltip content="Remove key from Rift. Note that this does not actually delete the key or data.">
        <Button onClick={removeKey}>Remove key</Button>
      </Tooltip>
      <Button onClick={saveChanges}>Save</Button>
    </ControlGroup>
  )
}
