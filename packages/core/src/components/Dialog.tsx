import React, { useCallback, useState } from 'react'
import {
  Button,
  ButtonVariant,
  Dialog as DsDialog,
  DialogContent,
  DialogTrigger,
  Tooltip,
} from '@riftdweb/design-system'

export function useDialog() {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const openDialog = useCallback(
    (e?: any) => {
      if (e) {
        e.preventDefault()
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
  triggerVariant?: ButtonVariant
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
  const Trigger = triggerAs
  return (
    <DsDialog open={isOpen} onOpenChange={setDialog}>
      {content ? (
        <Tooltip align="end" content={content}>
          <DialogTrigger asChild>
            <Trigger
              size={triggerSize}
              variant={triggerVariant}
              ghost={!triggerVariant}
              as={triggerAs}
              onClick={openDialog}
            >
              {triggerElement}
            </Trigger>
          </DialogTrigger>
        </Tooltip>
      ) : (
        <DialogTrigger asChild>
          <Trigger
            size={triggerSize}
            variant={triggerVariant}
            onClick={openDialog}
          >
            {triggerElement}
          </Trigger>
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
