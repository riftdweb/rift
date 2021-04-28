import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  Button,
  ButtonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Flex,
} from '@riftdweb/design-system'
import { copyToClipboard } from '../../../shared/clipboard'
import { AddKeyDialog } from './AddKeyDialog'
import { TreeNodeDirectory } from './KeysTree/transformKeys'

type Props = {
  treeNode: TreeNodeDirectory
  variant?: ButtonVariants['variant']
  size?: string
  right?: string
  color?: string
  onOpenChange?: (val: boolean) => void
}

export function ContextMenuDirectory({
  treeNode,
  variant = 'ghost',
  right = '0',
  size = '1',
  color = '$gray900',
  onOpenChange,
}: Props) {
  return (
    <Flex>
      <AddKeyDialog treeNode={treeNode} />
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
