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
  dataDomain: '',
}

const buildDomainSchema = (dataDomains: string[]) =>
  Yup.object().shape({
    dataDomain: Yup.string()
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required')
      // .equals('localhost', 'Currently only the permissions')
      .notOneOf(dataDomains, 'Name is taken'),
  })

type Props = {
  closeDialog: () => void
}

export function AddDomainMySky({ closeDialog }: Props) {
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

  const existingDataDomains = useMemo(
    () => domains.map((domain) => domain.dataDomain),
    [domains]
  )

  const validationSchema = useMemo(
    () => buildDomainSchema(existingDataDomains),
    [existingDataDomains]
  )

  const formik = useFormik({
    initialValues: {
      dataDomain: '',
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
            <Paragraph>
              Add any MySky data domain to view and edit the data.
            </Paragraph>
            <Flex css={{ flexDirection: 'column', gap: '$2' }}>
              <Flex>
                <Text>Data domain</Text>
                {formik.errors.name && (
                  <Text css={{ color: '$red900', flex: 1, textAlign: 'right' }}>
                    {formik.errors.name}
                  </Text>
                )}
              </Flex>
              <Input
                name="dataDomain"
                value={formik.values.dataDomain}
                onChange={formik.handleChange}
                size="3"
                placeholder="data domain"
              />
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
