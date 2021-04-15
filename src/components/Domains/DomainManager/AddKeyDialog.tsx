import {
  Dialog,
  DialogContent,
  DialogTrigger,
  Button,
  Subheading,
  Flex,
} from '@modulz/design-system'
import { PlusIcon } from '@radix-ui/react-icons'
import { useCallback, useState } from 'react'
import { Domain } from '../../../shared/types'
import { AddKeyForm } from './AddKeyForm'

type Props = {
  domain: Domain
  prefix: string
}

export function AddKeyDialog({ domain, prefix }: Props) {
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

  const noop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogTrigger as={Button} variant="ghost" onClick={openDialog}>
        <PlusIcon />
      </DialogTrigger>
      <DialogContent
        onClick={noop}
        css={{
          width: '800px',
        }}
      >
        <Flex css={{ flexDirection: 'column', gap: '$2' }}>
          <Subheading css={{ mb: '$2' }}>Add Path</Subheading>
          <AddKeyForm
            domain={domain}
            prefix={prefix}
            closeDialog={closeDialog}
          />
        </Flex>
      </DialogContent>
    </Dialog>
  )
}
