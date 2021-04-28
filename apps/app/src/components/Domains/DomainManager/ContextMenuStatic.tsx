import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Flex,
} from '@riftdweb/design-system'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { AddDomain } from '../_shared/AddDomain'
import { TreeNodeStatic } from './KeysTree/transformKeys'

type Props = {
  treeNode: TreeNodeStatic
  variant?: string
  size?: string
  right?: string
  color?: string
  onOpenChange?: (val: boolean) => void
}

export function ContextMenuStatic({
  treeNode,
  variant = 'ghost',
  right = '0',
  size = '1',
  color = '$gray900',
  onOpenChange,
}: Props) {
  return (
    <Flex>
      {treeNode.id === 'domains/discoverable' && <AddDomain />}
      {/* <AddKeyDialog domain={domain} prefix={path} /> */}
    </Flex>
  )
}
