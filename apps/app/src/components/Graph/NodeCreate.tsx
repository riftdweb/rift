import { Pencil1Icon, Pencil2Icon } from '@radix-ui/react-icons'
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
import { useFormik } from 'formik'
import { useCallback, useMemo, useState } from 'react'
import * as Yup from 'yup'
import { DataDac, Mutation } from './dac'
import { v4 as uuid } from 'uuid'

const buildSchema = () =>
  Yup.object().shape({
    title: Yup.string()
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required'),
  })

type Props = {
  parentId?: string
  dac: DataDac
}

export function NodeCreate({ parentId, dac }: Props) {
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

  const onSubmit = useCallback(
    (vals) => {
      const mutation: Mutation = {
        action: 'create',
        node: {
          id: uuid(),
          parentId,
          type: 'post',
          data: {
            title: vals.title,
          },
        },
      }
      if (dac.create(mutation)) {
        formik.resetForm()
        setIsOpen(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dac, setIsOpen, parentId]
  )

  const validationSchema = useMemo(() => buildSchema(), [])

  const formik = useFormik({
    initialValues: {
      title: '',
    },
    validationSchema,
    onSubmit,
  })

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogTrigger as={Button} onClick={openDialog}>
        <Pencil1Icon />
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
            <Subheading>Create Node</Subheading>
            <Flex css={{ mt: '$2', flexDirection: 'column', gap: '$3' }}>
              <Flex css={{ flexDirection: 'column', gap: '$3' }}>
                <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                  <Flex>
                    <Text>Title</Text>
                    {formik.errors.title && (
                      <Text
                        css={{ color: '$red900', flex: 1, textAlign: 'right' }}
                      >
                        {formik.errors.title}
                      </Text>
                    )}
                  </Flex>
                  <Input
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    size="3"
                    placeholder="hello..."
                  />
                </Flex>
              </Flex>
            </Flex>
            <Flex css={{ gap: '$1' }}>
              <Button
                size="2"
                variant="red"
                type="button"
                onClick={() => dac.delete('')}
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
