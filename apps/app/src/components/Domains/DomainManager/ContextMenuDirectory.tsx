import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  Button,
  ButtonVariant,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Flex,
} from '@riftdweb/design-system'
import { copyToClipboard } from '@riftdweb/core'
import { AddKeyDialog } from './AddKeyDialog'
import { TreeNodeDirectory } from './KeysTree/transformKeys'

type Props = {
  treeNode: TreeNodeDirectory
  variant?: ButtonVariant
  size?: '1' | '2'
  right?: string
  color?: string
  onOpenChange?: (val: boolean) => void
}

export function ContextMenuDirectory({
  treeNode,
  variant,
  right = '0',
  size = '1',
  color = '$gray11',
  onOpenChange,
}: Props) {
  return (
    <Flex>
      <AddKeyDialog treeNode={treeNode} />
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
          <DropdownMenuLabel>Copy</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={() => copyToClipboard(treeNode.fullKey, 'path')}
          >
            Path
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Flex>
  )
}
