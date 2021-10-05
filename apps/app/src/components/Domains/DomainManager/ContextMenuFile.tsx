import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  Button,
  ButtonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@riftdweb/design-system'
import { useDomains } from '@riftdweb/core/src/contexts/domains'
import { copyToClipboard } from '@riftdweb/core/src/shared/clipboard'
import { TreeNodeFile } from './KeysTree/transformKeys'

type Props = {
  treeNode: TreeNodeFile
  variant?: ButtonVariants['variant']
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
        variant={variant}
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
