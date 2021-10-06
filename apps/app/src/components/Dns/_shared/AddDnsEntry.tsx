import { Pencil2Icon } from '@radix-ui/react-icons'
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
import { parseSkylink } from 'skynet-js'
import * as Yup from 'yup'
import { useDns } from '@riftdweb/core'
import { SpinnerIcon } from '@riftdweb/core'
import { Dialog, useDialog } from '@riftdweb/core'
import { SkylinkInfo } from '@riftdweb/core'

const buildSchema = (existingNames: string[] = []) =>
  Yup.object().shape({
    name: Yup.string()
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required')
      .notOneOf(existingNames, 'Name is taken'),
    dataLink: Yup.string()
      .min(1, 'Too Short!')
      .max(52, 'Too Long!')
      .required('Required')
      .test(
        'check exists',
        'Invalid Skylink',
        (val) => !!parseSkylink(val || '')
      ),
  })

export function AddDnsEntry() {
  const dialogProps = useDialog()
  const { closeDialog } = dialogProps
  const { dns, addDnsEntry } = useDns()

  const onSubmit = useCallback(
    (vals): Promise<void> => {
      const newDnsEntry = {
        name: vals.name,
        dataLink: vals.dataLink,
      }
      const func = async () => {
        const success = await addDnsEntry(newDnsEntry)
        if (success) {
          formik.resetForm()
          closeDialog()
        }
      }
      return func()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addDnsEntry, closeDialog]
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
      dataLink: '',
    },
    validationSchema,
    onSubmit,
  })

  return (
    <Dialog
      {...dialogProps}
      content="Add DNS record"
      triggerSize="2"
      triggerElement={<Pencil2Icon />}
    >
      <form onSubmit={formik.handleSubmit}>
        <Flex
          css={{
            flexDirection: 'column',
            gap: '$3',
          }}
        >
          <Subheading>Add DNS Record</Subheading>
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
                  placeholder={'eg: "kalorama.hns" or "my custom name"'}
                />
              </Flex>
            </Flex>
            <Flex css={{ flexDirection: 'column', gap: '$3' }}>
              <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                <Flex>
                  <Text>Skylink</Text>
                  {formik.errors.dataLink && (
                    <Text
                      css={{ color: '$red900', flex: 1, textAlign: 'right' }}
                    >
                      {formik.errors.dataLink}
                    </Text>
                  )}
                </Flex>
                <Input
                  name="dataLink"
                  value={formik.values.dataLink}
                  onChange={formik.handleChange}
                  size="3"
                  placeholder="eg: CABbClj98..."
                />
              </Flex>
            </Flex>
            <Box css={{ padding: '$2 0' }}>
              {!formik.errors.dataLink && formik.values.dataLink && (
                <SkylinkInfo skylink={formik.values.dataLink} />
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
