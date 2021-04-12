import {
  Textarea,
  Dialog,
  DialogContent,
  DialogTrigger,
  Box,
  Button,
  Flex,
  Input,
  Text,
  Subheading,
  ControlGroup,
  Tooltip,
} from '@modulz/design-system'
import {
  Pencil2Icon,
  ExclamationTriangleIcon,
  CheckIcon,
} from '@radix-ui/react-icons'
import { useCallback, useMemo, useState } from 'react'
import { useApps } from '../../../hooks/useApps'
import { App } from '../../../shared/types'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import debounce from 'lodash/debounce'
import { skapps } from '../../../shared/skapps'
import SpinnerIcon from '../../_icons/SpinnerIcon'
import { useSkynet } from '../../../hooks/skynet'

const defaultAppValues: Partial<App> = {
  name: '',
  description: '',
  hnsDomain: '',
  tags: [],
}

const dGetHnsData = debounce(
  async (Api: any, hnsDomain: string, resolve: any) => {
    try {
      await Api.getFileContentHns(hnsDomain)
      resolve(true)
    } catch (e) {
      resolve(false)
    }
  },
  1000
)

const buildSchema = (Api: any, hnsDomains: string[] = []) =>
  Yup.object().shape({
    name: Yup.string()
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required')
      .notOneOf(hnsDomains, 'Name is taken'),
    hnsDomain: Yup.string()
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required')
      .notOneOf([], 'App already added')
      .test(
        'check exists',
        'App does not exist',
        (val) => new Promise((resolve) => dGetHnsData(Api, val, resolve))
      ),
  })

export function AddApp() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { addApp } = useApps()
  const { Api } = useSkynet()

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
        ...defaultAppValues,
        ...vals,
      }
      if (addApp(newSeed)) {
        formik.resetForm()
        setIsOpen(false)
      }
    },
    [addApp, setIsOpen]
  )

  const existingHnsDomains = useMemo(() => skapps.map((app) => app.hnsDomain), [
    skapps,
  ])

  const validationSchema = useMemo(() => buildSchema(Api, existingHnsDomains), [
    Api,
    existingHnsDomains,
  ])

  const formik = useFormik({
    initialValues: {
      name: '',
      hnsDomain: '',
      description: '',
    },
    validationSchema,
    onSubmit,
  })

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <Tooltip align="end" content="Add App">
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
            <Subheading>Add App</Subheading>
            <Box css={{ mt: '$2' }}>
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
                <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                  <Flex>
                    <Text>HNS Domain</Text>
                    {formik.errors.hnsDomain && (
                      <Text
                        css={{ color: '$red900', flex: 1, textAlign: 'right' }}
                      >
                        {formik.errors.hnsDomain}
                      </Text>
                    )}
                  </Flex>
                  <ControlGroup>
                    <Input
                      name="hnsDomain"
                      value={formik.values.hnsDomain}
                      onChange={formik.handleChange}
                      size="3"
                      placeholder="eg: skyfeed"
                    />
                    {formik.isValidating ? (
                      <Tooltip
                        align="end"
                        content="Checking HNS domain for app"
                      >
                        <Button size="2">
                          <SpinnerIcon />
                        </Button>
                      </Tooltip>
                    ) : formik.errors.hnsDomain ? (
                      <Tooltip align="end" content="No app found at HNS domain">
                        <Button size="2" css={{ color: '$red900' }}>
                          <ExclamationTriangleIcon />
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip align="end" content="App found at HNS domain">
                        <Button size="2" css={{ color: '$green900' }}>
                          <CheckIcon />
                        </Button>
                      </Tooltip>
                    )}
                  </ControlGroup>
                </Flex>
                <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                  <Flex>
                    <Text>Description</Text>
                    {formik.errors.description ? (
                      <Text
                        css={{ color: '$red900', flex: 1, textAlign: 'right' }}
                      >
                        {formik.errors.childSeed}
                      </Text>
                    ) : (
                      <Text
                        css={{ color: '$gray900', flex: 1, textAlign: 'right' }}
                      >
                        Optional
                      </Text>
                    )}
                  </Flex>
                  <Textarea
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    size="3"
                    placeholder="This app is great for sharing photos."
                  />
                  {formik.errors.description && (
                    <Text>{formik.errors.description}</Text>
                  )}
                </Flex>
              </Flex>
            </Box>
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
