import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@modulz/design-system'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useDomains } from '../../../hooks/domains'
import { copyToClipboard } from '../../../shared/clipboard'
import { TreeNodeFile } from './KeysTree/transformKeys'

type Props = {
  treeNode: TreeNodeFile
  variant?: string
  size?: string
  right?: string
  color?: string
  onOpenChange?: (val: boolean) => void
}

export function ContextMenuFile({
  treeNode,
  variant = 'ghost',
  right = '0',
  size = '1',
  color = '$gray900',
  onOpenChange,
}: Props) {
  const { removeKey } = useDomains()
  const { domain } = treeNode
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        as={Button}
        variant={variant as any}
        size={size}
        css={{
          right,
          position: 'relative',
          color,
        }}
      >
        <DotsHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => removeKey(domain.id, treeNode.id, true)}
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
