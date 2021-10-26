import { ButtonVariant, Flex } from '@riftdweb/design-system'
import { DomainContextMenu } from '../_shared/DomainContextMenu'
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

export function ContextMenuDomain({
  treeNode,
  variant,
  right = '0',
  size = '1',
  color = '$gray11',
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
      </DropdownMenu> */}
    </Flex>
  )
}
