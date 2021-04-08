import {
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
import { Pencil2Icon, SymbolIcon } from '@radix-ui/react-icons'
import { useCallback, useMemo, useState } from 'react'
import { useSeeds } from '../../../hooks/useSeeds'
import { Seed } from '../../../shared/types'
import { v4 as uuid } from 'uuid'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const defaultSeedValue: Seed = {
  id: '',
  parentSeed: '',
  name: '',
  childSeed: '',
  addedAt: new Date().toISOString(),
  keys: [],
}

const buildSeedSchema = (names: string[]) =>
  Yup.object().shape({
    name: Yup.string()
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required')
      .notOneOf(names, 'Name is taken'),
    parentSeed: Yup.string().min(1, 'Too Short!').required('Required'),
    childSeed: Yup.string().min(1, 'Too Short!'),
  })

export function AddSeed() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { seeds, addSeed } = useSeeds()

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
        ...defaultSeedValue,
        ...vals,
      }
      if (addSeed(newSeed)) {
        formik.resetForm()
        setIsOpen(false)
      }
    },
    [addSeed, setIsOpen]
  )

  const existingNames = useMemo(() => seeds.map((seed) => seed.name), [seeds])

  const validationSchema = useMemo(() => buildSeedSchema(existingNames), [
    existingNames,
  ])

  const formik = useFormik({
    initialValues: {
      parentSeed: '',
      name: '',
      childSeed: '',
    },
    validationSchema,
    onSubmit,
  })

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
        Add Seed
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
            <Subheading>Add Seed</Subheading>
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
                    placeholder="human readable name"
                  />
                </Flex>
                <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                  <Flex>
                    <Text>Seed</Text>
                    {formik.errors.parentSeed && (
                      <Text
                        css={{ color: '$red900', flex: 1, textAlign: 'right' }}
                      >
                        {formik.errors.parentSeed}
                      </Text>
                    )}
                  </Flex>
                  <ControlGroup>
                    <Input
                      name="parentSeed"
                      value={formik.values.parentSeed}
                      onChange={formik.handleChange}
                      size="3"
                      placeholder="Seed value"
                    />
                    <Tooltip content="Generate random seed">
                      <Button
                        onClick={() => {
                          formik.setFieldValue('parentSeed', uuid(), false)
                        }}
                        size="2"
                      >
                        <SymbolIcon />
                      </Button>
                    </Tooltip>
                  </ControlGroup>
                </Flex>
                <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                  <Flex>
                    <Text>Child seed</Text>
                    {formik.errors.childSeed ? (
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
                  <Input
                    name="childSeed"
                    value={formik.values.childSeed}
                    onChange={formik.handleChange}
                    size="3"
                    placeholder="Child seed, eg: 'MyApp'"
                  />
                  {formik.errors.childSeed && (
                    <Text>{formik.errors.childSeed}</Text>
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
              <Button size="2" type="submit">
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
