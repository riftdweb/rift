import { Flex } from '@riftdweb/design-system'
import { DomainContextMenu } from '../_shared/DomainContextMenu'
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

export function ContextMenuDomain({
  treeNode,
  variant = 'ghost',
  right = '0',
  size = '1',
  color = '$gray900',
  onOpenChange,
}: Props) {
  return (
    <Flex css={{ position: 'relative' }}>
      <AddKeyDialog treeNode={treeNode} />
      <DomainContextMenu
        domain={treeNode.domain}
        right="inherit"
        onOpenChange={onOpenChange}
      />
      {/* <DropdownMenu onOpenChange={onOpenChange}>
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
      </DropdownMenu> */}
    </Flex>
  )
}
