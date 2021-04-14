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
import { copyToClipboard } from '../../shared/clipboard'

type Props = {
  dataKey: string
  variant?: string
  size?: string
  right?: string
  color?: string
  onOpenChange?: (val: boolean) => void
}

export function DataKeyContextMenu({
  dataKey,
  variant = 'ghost',
  right = '0',
  size = '1',
  color = '$gray900',
  onOpenChange,
}: Props) {
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
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Copy</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => null}>Remove</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
