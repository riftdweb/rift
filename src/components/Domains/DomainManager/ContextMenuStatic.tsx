import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Flex,
} from '@modulz/design-system'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
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
      {/* <AddKeyDialog domain={domain} prefix={path} /> */}
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
          {/* <DropdownMenuItem onSelect={() => copyToClipboard(path, 'path')}>
            Path
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </Flex>
  )
}
