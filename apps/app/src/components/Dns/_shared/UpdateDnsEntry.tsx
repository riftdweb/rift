import { Pencil2Icon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Flex,
  Input,
  Subheading,
  Text,
} from '@riftdweb/design-system'
import { DnsEntry } from '@riftdweb/types'
import { useFormik } from 'formik'
import { useCallback, useMemo, useState } from 'react'
import { parseSkylink } from 'skynet-js'
import * as Yup from 'yup'
import { useDns } from '../../../hooks/useDns'
import { SkylinkInfo } from '../../_shared/SkylinkInfo'

const buildSchema = () =>
  Yup.object().shape({
    skylink: Yup.string()
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required')
      .test(
        'check exists',
        'Invalid Skylink',
        (val) => !!parseSkylink(val || '')
      ),
  })

type Props = {
  children: React.ReactNode
  dnsEntry: DnsEntry
}

export function UpdateDnsEntry({ children, dnsEntry }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { updateDnsEntry, removeDnsEntry } = useDns()

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

  const onSubmit = useCallback(
    (vals) => {
      const updatedSeed = {
        skylink: vals.skylink,
      }
      if (updateDnsEntry(dnsEntry.id, updatedSeed)) {
        formik.resetForm()
        setIsOpen(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateDnsEntry, setIsOpen, dnsEntry]
  )

  const validationSchema = useMemo(() => buildSchema(), [])

  const formik = useFormik({
    initialValues: {
      skylink: dnsEntry.skylink,
    },
    validationSchema,
    onSubmit,
  })

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogTrigger as={Box} onClick={openDialog}>
        {children}
      </DialogTrigger>
      <DialogContent
        css={{
          minWidth: '400px',
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <Flex
            css={{
              flexDirection: 'column',
              gap: '$3',
            }}
          >
            <Subheading>Update DNS Entry</Subheading>
            <Flex css={{ mt: '$2', flexDirection: 'column', gap: '$3' }}>
              <Flex css={{ flexDirection: 'column', gap: '$3' }}>
                <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                  <Flex>
                    <Text>Name</Text>
                  </Flex>
                  <Input name="name" disabled value={dnsEntry.name} size="3" />
                </Flex>
              </Flex>
              <Flex css={{ flexDirection: 'column', gap: '$3' }}>
                <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                  <Flex>
                    <Text>Skylink</Text>
                    {formik.errors.skylink && (
                      <Text
                        css={{ color: '$red900', flex: 1, textAlign: 'right' }}
                      >
                        {formik.errors.skylink}
                      </Text>
                    )}
                  </Flex>
                  <Input
                    name="skylink"
                    value={formik.values.skylink}
                    onChange={formik.handleChange}
                    size="3"
                    placeholder="eg: CABbClj98..."
                  />
                </Flex>
              </Flex>
              <Box css={{ padding: '$2 0' }}>
                {!formik.errors.skylink && formik.values.skylink && (
                  <SkylinkInfo skylink={formik.values.skylink} />
                )}
              </Box>
            </Flex>
            <Flex css={{ gap: '$1' }}>
              <Button
                size="2"
                variant="red"
                type="button"
                onClick={() => removeDnsEntry(dnsEntry.id)}
              >
                Delete
              </Button>
              <Box css={{ flex: 1 }} />
              <Button
                size="2"
                variant="ghost"
                type="button"
                onClick={closeDialog}
              >
                Cancel
              </Button>
              <Button size="2" type="submit" disabled={!formik.isValid}>
                <Box
                  css={{
                    mr: '$1',
                  }}
                >
                  <Pencil2Icon />
                </Box>
                Save
              </Button>
            </Flex>
          </Flex>
        </form>
      </DialogContent>
    </Dialog>
  )
}
