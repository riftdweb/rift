import { PlusIcon } from '@radix-ui/react-icons'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Flex,
  Heading,
} from '@riftdweb/design-system'
import { useCallback, useState } from 'react'
import { AddKeyForm } from './AddKeyForm'
import { TreeNodeDirectory } from './KeysTree/transformKeys'

type Props = {
  treeNode: TreeNodeDirectory
}

export function AddKeyDialog({ treeNode }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const openDialog = useCallback(
    (e?: any) => {
      if (e) {
        e.stopPropagation()
      }
      setIsOpen(true)
    },
    [setIsOpen]
  )

  const closeDialog = useCallback(
    (e?: any) => {
      if (e) {
        e.preventDefault()
      }
      setIsOpen(false)
    },
    [setIsOpen]
  )

  const toggleDialog = useCallback(
    (val) => {
      val ? openDialog() : closeDialog()
    },
    [openDialog, closeDialog]
  )

  const stopPropagation = useCallback((e) => {
    e.stopPropagation()
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogTrigger asChild>
        <Button ghost onClick={openDialog}>
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent
        onClick={stopPropagation}
        css={{
          width: '600px',
        }}
      >
        <Flex css={{ flexDirection: 'column', gap: '$2' }}>
          <Heading size="1" css={{ mb: '$2' }}>
            Add Path
          </Heading>
          <AddKeyForm treeNode={treeNode} closeDialog={closeDialog} />
        </Flex>
      </DialogContent>
    </Dialog>
  )
}
