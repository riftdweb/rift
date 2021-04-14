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
import { Pencil2Icon } from '@radix-ui/react-icons'
import { useCallback, useState } from 'react'
import { useDomains } from '../../../hooks/domains'
import { Domain } from '../../../shared/types'
import * as Yup from 'yup'
import { AddDomainSeed } from './AddDomainSeed'
import { AddDomainMySky } from './AddDomainMySky'

export function AddDomain() {
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

  const toggleDialog = useCallback(
    (val) => {
      val ? openDialog() : closeDialog()
    },
    [openDialog, closeDialog]
  )

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogTrigger size="2" as={Button} onClick={openDialog}>
        <Box
          css={{
            mr: '$1',
          }}
        >
          <Pencil2Icon />
        </Box>
        Add Domain
      </DialogTrigger>
      <DialogContent
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
