import {
  Dialog,
  DialogContent,
  DialogTrigger,
  Box,
  Button,
  Tabs,
  TabsList,
  TabsTab,
  TabsPanel,
  Text,
  Subheading,
  Flex,
} from '@modulz/design-system'
import { PlusIcon } from '@radix-ui/react-icons'
import { useCallback, useState } from 'react'
import { AddDomainSeed } from './AddDomainSeed'
import { AddDomainMySky } from './AddDomainMySky'

type Props = {
  children?: React.ReactNode
  variant?: string
}

export function AddDomain({ children, variant = 'ghost' }: Props) {
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
      <DialogTrigger as={Button} variant={variant as any} onClick={openDialog}>
        {children || <PlusIcon />}
      </DialogTrigger>
      <DialogContent
        onClick={stopPropagation}
        css={{
          width: '400px',
        }}
      >
        <Flex css={{ flexDirection: 'column', gap: '$2' }}>
          <Subheading css={{ mb: '$2' }}>Add Domain</Subheading>
          <Tabs defaultValue="mysky">
            <TabsList>
              <TabsTab value="mysky">MySky</TabsTab>
              <TabsTab value="seed">Seed</TabsTab>
            </TabsList>
            <TabsPanel value="mysky">
              <AddDomainMySky closeDialog={closeDialog} />
            </TabsPanel>
            <TabsPanel value="seed">
              <AddDomainSeed closeDialog={closeDialog} />
            </TabsPanel>
          </Tabs>
        </Flex>
      </DialogContent>
    </Dialog>
  )
}