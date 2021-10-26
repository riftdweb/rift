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
} from '@riftdweb/design-system'
import { useDomains, copyToClipboard } from '@riftdweb/core'
import { TreeNodeFile } from './KeysTree/transformKeys'

type Props = {
  treeNode: TreeNodeFile
  variant?: ButtonVariant
  size?: '1' | '2'
  right?: string
  color?: string
  onOpenChange?: (val: boolean) => void
}

export function ContextMenuFile({
  treeNode,
  variant,
  right = '0',
  size = '1',
  color = '$gray900',
  onOpenChange,
}: Props) {
  const { removeKey } = useDomains()
  const { domain } = treeNode
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          ghost={!variant}
          size={size}
          css={{
            right,
            position: 'relative',
            color,
          }}
        >
          <DotsHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => removeKey(domain.id, treeNode.key, true)}
        >
          Remove
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Copy</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => copyToClipboard(treeNode.fullKey, 'path')}
        >
          Path
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
