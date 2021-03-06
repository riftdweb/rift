import { Pencil2Icon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Flex,
  TextField,
  Heading,
  Text,
} from '@riftdweb/design-system'
import { DnsEntry } from '@riftdweb/types'
import { useFormik } from 'formik'
import { useCallback, useMemo } from 'react'
import { parseSkylink } from 'skynet-js'
import * as Yup from 'yup'
import {
  useDns,
  SpinnerIcon,
  Dialog,
  useDialog,
  SkylinkInfo,
} from '@riftdweb/core'

const buildSchema = () =>
  Yup.object().shape({
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

type Props = {
  children: React.ReactNode
  dnsEntry: DnsEntry
}

export function UpdateDnsEntry({ children, dnsEntry }: Props) {
  const dialogProps = useDialog()
  const { closeDialog } = dialogProps
  const { updateDnsEntry, removeDnsEntry } = useDns()

  const onSubmit = useCallback(
    (vals): Promise<void> => {
      const updatedDnsEntry = {
        dataLink: vals.dataLink,
      }
      const func = async () => {
        const success = await updateDnsEntry(dnsEntry.id, updatedDnsEntry)
        if (success) {
          formik.resetForm()
          closeDialog()
        }
      }
      return func()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateDnsEntry, closeDialog, dnsEntry]
  )

  const validationSchema = useMemo(() => buildSchema(), [])

  const formik = useFormik({
    initialValues: {
      dataLink: dnsEntry.dataLink,
    },
    validationSchema,
    onSubmit,
  })

  return (
    <Dialog triggerAs={Box} triggerElement={children} {...dialogProps}>
      <form onSubmit={formik.handleSubmit}>
        <Flex
          css={{
            flexDirection: 'column',
            gap: '$3',
          }}
        >
          <Heading size="1">Update DNS Record</Heading>
          <Flex css={{ mt: '$2', flexDirection: 'column', gap: '$3' }}>
            <Flex css={{ flexDirection: 'column', gap: '$3' }}>
              <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                <Flex>
                  <Text>Name</Text>
                </Flex>
                <TextField
                  name="name"
                  disabled
                  value={dnsEntry.name}
                  size="2"
                />
              </Flex>
            </Flex>
            <Flex css={{ flexDirection: 'column', gap: '$3' }}>
              <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                <Flex>
                  <Text>Target skylink</Text>
                  {formik.errors.dataLink && (
                    <Text
                      css={{ color: '$red10', flex: 1, textAlign: 'right' }}
                    >
                      {formik.errors.dataLink}
                    </Text>
                  )}
                </Flex>
                <TextField
                  name="dataLink"
                  spellCheck={false}
                  value={formik.values.dataLink}
                  onChange={formik.handleChange}
                  size="2"
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
