import { CardStackPlusIcon, Pencil2Icon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  ControlGroup,
  Flex,
  TextField,
  Heading,
  Text,
} from '@riftdweb/design-system'
import { useFormik } from 'formik'
import { useCallback, useMemo } from 'react'
import * as Yup from 'yup'
import {
  SpinnerIcon,
  Dialog,
  useDialog,
  useFs,
  CreateDirectoryParams,
} from '@riftdweb/core'

const buildSchema = (existingNames: string[] = []) =>
  Yup.object().shape({
    name: Yup.string()
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required')
      .notOneOf(existingNames, 'Name is taken'),
  })

export function CreateDirectory() {
  const dialogProps = useDialog()
  const { closeDialog } = dialogProps
  const { activeDirectoryPath, activeDirectoryIndex, createDirectory } = useFs()

  const onSubmit = useCallback(
    (vals): Promise<void> => {
      const newDirectory: CreateDirectoryParams = {
        name: vals.name,
      }
      const func = async () => {
        const success = await createDirectory(newDirectory)
        if (success) {
          formik.resetForm()
          closeDialog()
        }
      }
      return func()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [createDirectory, closeDialog]
  )

  const existingNames = useMemo(
    () => activeDirectoryIndex.data?.entries.map((e) => e.data.name) || [],
    [activeDirectoryIndex.data]
  )

  const validationSchema = useMemo(() => buildSchema(existingNames), [
    existingNames,
  ])

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
      content="Create directory"
      triggerSize="2"
      triggerVariant="gray"
      triggerElement={<CardStackPlusIcon />}
    >
      <form onSubmit={formik.handleSubmit}>
        <Flex
          css={{
            flexDirection: 'column',
            gap: '$3',
          }}
        >
          <Heading size="1">Create Directory</Heading>
          <Flex css={{ mt: '$2', flexDirection: 'column', gap: '$3' }}>
            <Flex css={{ flexDirection: 'column', gap: '$3' }}>
              <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                <Flex>
                  <Text>Name</Text>
                  {formik.errors.name && (
                    <Text
                      css={{ color: '$red10', flex: 1, textAlign: 'right' }}
                    >
                      {formik.errors.name}
                    </Text>
                  )}
                </Flex>

                <ControlGroup>
                  <Button type="button" disabled size="2">
                    {activeDirectoryPath.length > 20
                      ? `...${activeDirectoryPath.slice(
                          -20,
                          activeDirectoryPath.length
                        )}`
                      : activeDirectoryPath}
                    /
                  </Button>
                  <TextField
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    size="2"
                    placeholder={'My Photos'}
                  />
                </ControlGroup>
              </Flex>
            </Flex>
          </Flex>
          <Flex css={{ jc: 'flex-end', gap: '$1' }}>
            <Button size="2" ghost type="button" onClick={closeDialog}>
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
