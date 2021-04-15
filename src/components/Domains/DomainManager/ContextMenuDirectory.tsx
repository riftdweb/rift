import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Flex,
} from '@modulz/design-system'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useDomains } from '../../../hooks/domains'
import { copyToClipboard } from '../../../shared/clipboard'
import { AddKeyDialog } from './AddKeyDialog'
import { TreeNodeDirectory } from './KeysTree/transformKeys'

type Props = {
  treeNode: TreeNodeDirectory
  variant?: string
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
  const { removeKey } = useDomains()
  return (
    <Flex>
      <AddKeyDialog domain={treeNode.domain} prefix={treeNode.treeKey} />
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
