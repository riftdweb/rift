import { Flex } from '@riftdweb/design-system'
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
  variant,
  right = '0',
  size = '1',
  color = '$gray11',
  onOpenChange,
}: Props) {
  return (
    <Flex>
      {treeNode.id === 'domains/discoverable' && <AddDomain />}
      {/* <AddKeyDialog domain={domain} prefix={path} /> */}
    </Flex>
  )
}
