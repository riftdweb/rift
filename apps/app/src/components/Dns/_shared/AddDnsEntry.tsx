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
  Tooltip,
} from '@riftdweb/design-system'
import { useFormik } from 'formik'
import { useCallback, useMemo, useState } from 'react'
import { parseSkylink } from 'skynet-js'
import * as Yup from 'yup'
import { useDns } from '../../../hooks/useDns'
import { SkylinkInfo } from '../../_shared/SkylinkInfo'

const buildSchema = (existingNames: string[] = []) =>
  Yup.object().shape({
    name: Yup.string()
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required')
      .notOneOf(existingNames, 'Name is taken'),
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

export function AddDnsEntry() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { dns, addDnsEntry } = useDns()

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
      const newSeed = {
        name: vals.name,
        skylink: vals.skylink,
      }
      if (addDnsEntry(newSeed)) {
        formik.resetForm()
        setIsOpen(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addDnsEntry, setIsOpen]
  )

  const existingNames = useMemo(
    () => dns.data?.entries.map((e) => e.name) || [],
    [dns.data]
  )

  const validationSchema = useMemo(
    () => buildSchema(existingNames),
    [existingNames]
  )

  const formik = useFormik({
    initialValues: {
      name: '',
      skylink: '',
    },
    validationSchema,
    onSubmit,
  })

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <Tooltip align="end" content="Add DNS Entry">
        <DialogTrigger size="2" as={Button} onClick={openDialog}>
          <Pencil2Icon />
        </DialogTrigger>
      </Tooltip>
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
            <Subheading>Add DNS Entry</Subheading>
            <Flex css={{ mt: '$2', flexDirection: 'column', gap: '$3' }}>
              <Flex css={{ flexDirection: 'column', gap: '$3' }}>
                <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                  <Flex>
                    <Text>Name</Text>
                    {formik.errors.name && (
                      <Text
                        css={{ color: '$red900', flex: 1, textAlign: 'right' }}
                      >
                        {formik.errors.name}
                      </Text>
                    )}
                  </Flex>
                  <Input
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    size="3"
                    placeholder="eg: SkyFeed"
                  />
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
            <Flex css={{ jc: 'flex-end', gap: '$1' }}>
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
