import {
  Button,
  ButtonVariants,
  Dialog as DsDialog,
  DialogContent,
  DialogTrigger,
  Tooltip,
} from '@riftdweb/design-system'
import { useCallback, useState } from 'react'

export function useDialog() {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const openDialog = useCallback(() => {
    setIsOpen(true)
  }, [setIsOpen])

  const closeDialog = useCallback(
    (e?: any) => {
      if (e) {
        e.preventDefault()
      }
      setIsOpen(false)
    },
    [setIsOpen]
  )

  const setDialog = useCallback(
    (open: boolean) => {
      open ? openDialog() : closeDialog()
    },
    [openDialog, closeDialog]
  )

  return {
    isOpen,
    openDialog,
    closeDialog,
    setDialog,
  }
}

type Props = {
  content?: string
  triggerAs?: any
  triggerElement: React.ReactNode
  triggerSize?: string
  triggerVariant?: ButtonVariants['variant']
  children: React.ReactNode
  isOpen: boolean
  openDialog: () => void
  closeDialog: (e?: any) => void
  setDialog: (open: boolean) => void
}

export function Dialog({
  content,
  triggerAs = Button,
  triggerElement,
  triggerSize,
  triggerVariant,
  openDialog,
  setDialog,
  isOpen,
  children,
}: Props) {
  return (
    <DsDialog open={isOpen} onOpenChange={setDialog}>
      {content ? (
        <Tooltip align="end" content={content}>
          <DialogTrigger
            size={triggerSize}
            variant={triggerVariant}
            as={triggerAs}
            onClick={openDialog}
          >
            {triggerElement}
          </DialogTrigger>
        </Tooltip>
      ) : (
        <DialogTrigger
          size={triggerSize}
          variant={triggerVariant}
          as={triggerAs}
          onClick={openDialog}
        >
          {triggerElement}
        </DialogTrigger>
      )}
      <DialogContent
        css={{
          minWidth: '400px',
          overflow: 'auto',
        }}
      >
        {children}
      </DialogContent>
    </DsDialog>
  )
}
