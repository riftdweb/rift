import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  Paragraph,
  Tooltip,
  ControlGroup,
} from '@modulz/design-system'
import {
  CheckIcon,
  ExclamationTriangleIcon,
  Pencil2Icon,
} from '@radix-ui/react-icons'
import { useCallback, useMemo } from 'react'
import { useDomains } from '../../../hooks/domains'
import debounce from 'lodash/debounce'
import { Domain } from '../../../shared/types'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import SpinnerIcon from '../../_icons/SpinnerIcon'
import { useSkynet } from '../../../hooks/skynet'

const defaultDomainValues: Partial<Domain> = {
  dataDomain: '',
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

const buildDomainSchema = (Api: any, dataDomains: string[]) =>
  Yup.object().shape({
    dataDomain: Yup.string()
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required')
      .test(
        'hns',
        'Must contain .hns',
        (val) => val === 'localhost' || val.includes('.hns')
      )
      .notOneOf(dataDomains, 'Already added')
      .test(
        'check exists',
        'Domain does not exist',
        (val) =>
          new Promise((resolve) =>
            dGetHnsData(Api, val.replace('.hns', ''), resolve)
          )
      ),
  })

type Props = {
  closeDialog: () => void
}

export function AddDomainMySky({ closeDialog }: Props) {
  const { domains, addDomain } = useDomains()
  const { Api } = useSkynet()

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
    () => buildDomainSchema(Api, existingDataDomains),
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
                {formik.errors.dataDomain && (
                  <Text css={{ color: '$red900', flex: 1, textAlign: 'right' }}>
                    {formik.errors.dataDomain}
                  </Text>
                )}
              </Flex>
              <ControlGroup>
                <Input
                  name="dataDomain"
                  value={formik.values.dataDomain}
                  onChange={formik.handleChange}
                  size="3"
                  placeholder="eg: skyfeed"
                  css={{
                    boxShadow:
                      'inset 0 0 0 1px $blue500, inset 0 0 0 100px $blue200',
                  }}
                />
                {formik.isValidating ? (
                  <Tooltip align="end" content="Checking HNS domain for app">
                    <Button size="2">
                      <SpinnerIcon />
                    </Button>
                  </Tooltip>
                ) : formik.errors.dataDomain ? (
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
