import {
  Box,
  Button,
  ControlGroup,
  DropdownMenu,
  Code,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Text,
  Tooltip,
} from '@modulz/design-system'
import {
  DotsHorizontalIcon,
  ResetIcon,
  RulerHorizontalIcon,
  SymbolIcon,
  ThickArrowUpIcon,
} from '@radix-ui/react-icons'
import { copyToClipboard } from '../../../shared/clipboard'
import SpinnerIcon from '../../_icons/SpinnerIcon'

type Props = {
  skylink: string
  isDataLatest: boolean
  isValid: boolean
  isEmpty: boolean
  isValidating: boolean
  isSaving: boolean
  formatCode: () => void
  refreshKey: () => void
  revertChanges: () => void
  saveChanges: () => void
  removeKey: () => void
}

export function KeysToolbar({
  skylink,
  saveChanges,
  refreshKey,
  revertChanges,
  removeKey,
  formatCode,
  isValid,
  isEmpty,
  isValidating,
  isSaving,
  isDataLatest,
}: Props) {
  let message = ''
  if (isSaving) {
    message = 'Saving...'
  } else if (isValidating) {
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
      <Tooltip
        align="start"
        content={
          !skylink && !isValidating ? 'No Skylink yet' : 'Latest Skylink'
        }
      >
        <Code
          css={{
            lineHeight: '20px',
            cursor: 'pointer',
            border: '1px solid $gray400',
            borderRadius: '3px',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
          onClick={() => skylink && copyToClipboard(skylink, 'skylink')}
        >
          {!skylink && !isValidating ? 'N/A' : `${skylink.slice(0, 10)}...`}
        </Code>
      </Tooltip>
      <Text size="1" css={{ flex: 1, color: '$gray900', ml: '$2' }}>
        {message}
      </Text>
      <ControlGroup>
        <Tooltip content="Revert all changes">
          <Button disabled={isDataLatest} onClick={revertChanges}>
            <Box
              css={{
                mr: '$1',
              }}
            >
              <ResetIcon />
            </Box>
            Revert
          </Button>
        </Tooltip>
        <Tooltip content="Resync data key from network">
          <Button disabled={isSaving || isValidating} onClick={refreshKey}>
            <Box
              css={{
                mr: '$1',
              }}
            >
              {isValidating ? <SpinnerIcon /> : <SymbolIcon />}
            </Box>
            Resync
          </Button>
        </Tooltip>
        <Button onClick={formatCode}>
          <Box
            css={{
              mr: '$1',
            }}
          >
            <RulerHorizontalIcon />
          </Box>
          Format
        </Button>
        <Button
          disabled={isEmpty || isDataLatest || !isValid}
          onClick={saveChanges}
        >
          <Box
            css={{
              mr: '$1',
            }}
          >
            <ThickArrowUpIcon />
          </Box>
          Save
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger as={Button}>
            <DotsHorizontalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem css={{ width: '100%' }} onSelect={removeKey}>
              <Tooltip content="Remove data key">
                <Box css={{ width: '100%' }}>Remove</Box>
              </Tooltip>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ControlGroup>
    </Flex>
  )
}