import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  Button,
  ButtonVariant,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
} from '@riftdweb/design-system'
import { useDocs, copyToClipboard, SpinnerIcon } from '@riftdweb/core'

type Props = {
  docId: string
  variant?: ButtonVariant
  size?: '1' | '2'
  right?: string
}

export function DocContextMenu({
  docId,
  variant,
  right = '0',
  size = '1',
}: Props) {
  const { docList, removeDoc, docStateMap } = useDocs()
  const doc = docList.data?.entries.find((doc) => doc.id === docId)
  const isSyncing = docStateMap[docId]?.isSyncing || false

  return (
    <DropdownMenu>
      <Tooltip align="end" content={isSyncing ? 'Syncing' : 'Open doc menu'}>
        <DropdownMenuTrigger asChild>
          <Button
            ghost={!variant}
            variant={variant}
            size={size}
            css={{
              right,
              color: '$gray500',
              position: 'relative',
            }}
          >
            {isSyncing ? <SpinnerIcon /> : <DotsHorizontalIcon />}
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => removeDoc(docId)}>
          Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Copy</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => copyToClipboard(doc.id, 'ID')}>
          ID
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => copyToClipboard(doc.name, 'name')}>
          Name
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
