import { Pencil2Icon, PlusIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Flex,
  Input,
  Subheading,
  Text,
} from '@riftdweb/design-system'
import { useFormik } from 'formik'
import { useCallback, useMemo } from 'react'
import * as Yup from 'yup'
import { useDocs, SpinnerIcon, Dialog, useDialog } from '@riftdweb/core'

const buildSchema = () =>
  Yup.object().shape({
    name: Yup.string()
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required'),
  })

export function AddDoc() {
  const dialogProps = useDialog()
  const { closeDialog } = dialogProps
  const { addDoc } = useDocs()

  const onSubmit = useCallback(
    (vals): Promise<void> => {
      const newDoc = {
        name: vals.name,
      }
      const func = async () => {
        const success = await addDoc(newDoc, true)
        if (success) {
          formik.resetForm()
          closeDialog()
        }
      }
      return func()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addDoc, closeDialog]
  )

  const validationSchema = useMemo(() => buildSchema(), [])

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema,
    onSubmit,
  })

  return (
    <Dialog
      {...dialogProps}
      content="Add Doc"
      triggerSize="1"
      triggerElement={<PlusIcon />}
    >
      <form onSubmit={formik.handleSubmit}>
        <Flex
          css={{
            flexDirection: 'column',
            gap: '$3',
          }}
        >
          <Subheading>Add Doc</Subheading>
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
                  placeholder={'my new page'}
                />
              </Flex>
            </Flex>
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
            <Button
              size="2"
              type="submit"
              disabled={formik.isSubmitting || !formik.isValid}
            >
              <Box
                css={{
                  mr: '$1',
                }}
              >
                {formik.isSubmitting ? <SpinnerIcon /> : <Pencil2Icon />}
              </Box>
              Save
            </Button>
          </Flex>
        </Flex>
      </form>
    </Dialog>
  )
}
