import { Box, Button, ControlGroup, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Flex, Text, Tooltip } from '@modulz/design-system'
import { GearIcon, RulerHorizontalIcon, SymbolIcon, ThickArrowUpIcon } from '@radix-ui/react-icons'
import SpinnerIcon from '../_icons/SpinnerIcon'

type Props = {
  revision: number
  isDataLatest: boolean
  isValid: boolean
  isFetching: boolean
  formatCode: () => void
  refreshKey: () => void
  saveChanges: () => void
  removeKey: () => void
}

export function KeysToolbar({
  revision,
  saveChanges,
  refreshKey,
  removeKey,
  formatCode,
  isValid,
  isFetching,
  isDataLatest,
}: Props) {
  let message = ''
  if (isFetching) {
    message = 'Fetching latest data...'
  } else {
    if (!isValid) {
      message = 'Invalid JSON'
    } else if (isDataLatest) {
      message = 'Showing latest data'
    } else {
      message = 'Showing unsaved changes'
    }
  }
  return (
    <Flex css={{ margin: '$2 0 $2', alignItems: 'center', width: '100%' }}>
      <Button
        disabled>
        Revision {revision}
      </Button>
      <Text
        size="1"
        css={{ flex: 1, color: '$gray500', ml: '$2' }}>
        {message}
      </Text>
      <ControlGroup>
        <Tooltip content="Resync data key from network">
          <Button
            disabled={isFetching}
            onClick={refreshKey}>
            <Box
              css={{
                mr: '$1',
              }}>
              {isFetching ?
                <SpinnerIcon />
                : <SymbolIcon />
              }
            </Box>
            Resync
          </Button>
        </Tooltip>
        <Button onClick={formatCode}>
          <Box
            css={{
              mr: '$1',
            }}>
            <RulerHorizontalIcon />
          </Box>
          Format
        </Button>
        <Button
          disabled={isDataLatest || !isValid}
          onClick={saveChanges}>
          <Box
            css={{
              mr: '$1',
            }}>
            <ThickArrowUpIcon />
          </Box>
          Save
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger as={Button}>
            <GearIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              css={{ width: '100%' }}
              onSelect={removeKey}>
              <Tooltip content="Delete data key - note that this only deletes locally">
                <Box css={{ width: '100%' }}>
                  Delete
                </Box>
              </Tooltip>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ControlGroup>
    </Flex>
  )
}
