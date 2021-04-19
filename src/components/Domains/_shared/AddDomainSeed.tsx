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
  Paragraph,
} from '@modulz/design-system'
import { Pencil2Icon, SymbolIcon } from '@radix-ui/react-icons'
import { useCallback, useMemo, useState } from 'react'
import { useDomains } from '../../../hooks/domains'
import { Domain } from '../../../shared/types'
import { v4 as uuid } from 'uuid'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const defaultDomainValues: Partial<Domain> = {
  parentSeed: '',
  name: '',
  childSeed: '',
}

const buildDomainSchema = (names: string[]) =>
  Yup.object().shape({
    name: Yup.string()
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required')
      .notOneOf(names, 'Name is taken'),
    parentSeed: Yup.string().min(1, 'Too Short!').required('Required'),
    childSeed: Yup.string().min(1, 'Too Short!'),
  })

type Props = {
  closeDialog: () => void
}

export function AddDomainSeed({ closeDialog }: Props) {
  const { domains, addDomain } = useDomains()

  const onSubmit = useCallback(
    (vals) => {
      const newDomain = {
        ...defaultDomainValues,
        ...vals,
      }
      if (addDomain(newDomain)) {
        formik.resetForm()
        closeDialog()
      }
    },
    [addDomain, closeDialog]
  )

  const existingNames = useMemo(() => domains.map((domain) => domain.name), [
    domains,
  ])

  const validationSchema = useMemo(() => buildDomainSchema(existingNames), [
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
    <form onSubmit={formik.handleSubmit}>
      <Flex
        css={{
          flexDirection: 'column',
          gap: '$3',
          padding: '$2 0',
        }}
      >
        <Box>
          <Flex css={{ flexDirection: 'column', gap: '$3' }}>
            <Paragraph css={{ color: '$gray900' }}>
              Add a data domain manually via explicit seed.
            </Paragraph>
            <Flex css={{ flexDirection: 'column', gap: '$2' }}>
              <Flex>
                <Text>Name</Text>
                {formik.errors.name && (
                  <Text css={{ color: '$red900', flex: 1, textAlign: 'right' }}>
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
                  <Text css={{ color: '$red900', flex: 1, textAlign: 'right' }}>
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
                  css={{
                    boxShadow:
                      'inset 0 0 0 1px var(--colors-blue500), inset 0 0 0 100px var(--colors-blue200) !important',
                  }}
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
                  <Text css={{ color: '$red900', flex: 1, textAlign: 'right' }}>
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
          <Button size="2" variant="ghost" type="button" onClick={closeDialog}>
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
  )
}
