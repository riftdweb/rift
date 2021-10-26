import {
  DotsHorizontalIcon,
  LockClosedIcon,
  Pencil2Icon,
  ResetIcon,
  RulerHorizontalIcon,
  SymbolIcon,
  ThickArrowUpIcon,
} from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Code,
  ControlGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Text,
  Tooltip,
} from '@riftdweb/design-system'
import { useMemo } from 'react'
import { copyToClipboard, SpinnerIcon } from '@riftdweb/core'

type Props = {
  skylink: string
  isDataLatest: boolean
  isValid: boolean
  isEmpty: boolean
  isValidating: boolean
  isReadOnly: boolean
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
  isReadOnly,
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
  const cleanSkylink = useMemo(() => skylink.replace('sia://', ''), [skylink])

  return (
    <Flex css={{ margin: '$2 0 $2', alignItems: 'center', width: '100%' }}>
      <Tooltip
        align="start"
        content={
          !cleanSkylink && !isValidating ? 'No Skylink yet' : 'Latest Skylink'
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
          onClick={() =>
            cleanSkylink && copyToClipboard(cleanSkylink, 'skylink')
          }
        >
          {!cleanSkylink && !isValidating
            ? 'N/A'
            : `${cleanSkylink.slice(0, 10)}...`}
        </Code>
      </Tooltip>
      {isReadOnly ? (
        <Tooltip content="File permissions are read-only">
          <Box css={{ color: '$gray900', margin: '0 $1 0 $2' }}>
            <LockClosedIcon />
          </Box>
        </Tooltip>
      ) : (
        <Tooltip content="File permissions are read-write">
          <Box css={{ color: '$gray900', margin: '0 $1 0 $2' }}>
            <Pencil2Icon />
          </Box>
        </Tooltip>
      )}
      <Text size="1" css={{ flex: 1, color: '$gray900' }}>
        {message}
      </Text>
      <ControlGroup>
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
        <Tooltip content="Revert all changes">
          <Button disabled={isReadOnly || isDataLatest} onClick={revertChanges}>
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
        <Button disabled={isReadOnly} onClick={formatCode}>
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
          disabled={isReadOnly || isEmpty || isDataLatest || !isValid}
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
          <DropdownMenuTrigger asChild>
            <Button>
              <DotsHorizontalIcon />
            </Button>
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
