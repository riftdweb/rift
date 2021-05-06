import {
  CheckIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  Pencil2Icon,
} from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Checkbox,
  Code,
  ControlGroup,
  Flex,
  Input,
  Paragraph,
  Text,
  Tooltip,
} from '@riftdweb/design-system'
import { useFormik } from 'formik'
import debounce from 'lodash/debounce'
import difference from 'lodash/difference'
import { Fragment, useCallback, useMemo } from 'react'
import * as Yup from 'yup'
import { useDomains } from '../../../hooks/domains'
import { useSkynet } from '../../../hooks/skynet'
import SpinnerIcon from '../../_icons/SpinnerIcon'
import { Link } from '../../_shared/Link'
import { getDefaultPaths, SUGGESTED_DOMAINS } from './suggestedDomains'

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
      .required('Required')
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .test(
        'hns',
        'Must contain .hns',
        (val) => val && (val === 'localhost' || val.includes('.hns'))
      )
      .notOneOf(dataDomains, 'Already added')
      .test('check exists', 'Domain does not exist', (val) => {
        if (!val) {
          return false
        }
        if (val === 'localhost') {
          return true
        }
        return new Promise((resolve) =>
          dGetHnsData(Api, val.replace('.hns', ''), resolve)
        )
      }),
  })

type Props = {
  closeDialog: () => void
}

export function AddDomainMySky({ closeDialog }: Props) {
  const { domains, addDomain } = useDomains()
  const { Api, userId, dataDomain: appDomain } = useSkynet()

  const onSubmit = useCallback(
    (vals) => {
      const defaultPaths = getDefaultPaths(appDomain, vals.dataDomain)

      const newDomain = {
        dataDomain: vals.dataDomain,
        keys: (vals.addDefaultPaths ? defaultPaths : []).map((path) => ({
          id: path,
          key: path,
        })),
      }

      if (addDomain(newDomain)) {
        formik.resetForm()
        closeDialog()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addDomain, closeDialog, appDomain]
  )

  const existingDataDomains = useMemo(
    () => domains.map((domain) => domain.dataDomain),
    [domains]
  )

  const validationSchema = useMemo(
    () => buildDomainSchema(Api, existingDataDomains),
    [Api, existingDataDomains]
  )

  const formik = useFormik({
    initialValues: {
      dataDomain: '',
      addDefaultPaths: true,
    },
    validationSchema,
    onSubmit,
  })

  const defaultPaths = getDefaultPaths(appDomain, formik.values.dataDomain)

  const isReadOnly = ![appDomain].includes(formik.values.dataDomain)

  const suggestedDomains = difference(SUGGESTED_DOMAINS, existingDataDomains)

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
              {userId
                ? 'Add any MySky data domain to view and edit the data.'
                : 'Must be logged in to a MySky identity to add a data domain.'}
            </Paragraph>
            {userId && (
              <Fragment>
                <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                  <Flex>
                    <Text>Data domain</Text>
                    {formik.errors.dataDomain && (
                      <Text
                        css={{ color: '$red900', flex: 1, textAlign: 'right' }}
                      >
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
                      placeholder="eg: skyfeed.hns"
                      css={{
                        boxShadow:
                          'inset 0 0 0 1px var(--colors-blue500), inset 0 0 0 100px var(--colors-blue200) !important',
                      }}
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
                {!formik.values.dataDomain && suggestedDomains.length && (
                  <Flex
                    css={{
                      color: '$gray900',
                      gap: '$1',
                      textAlign: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Text
                      css={{
                        position: 'relative',
                        top: '1px',
                        color: '$gray900',
                      }}
                    >
                      Suggestions:
                    </Text>
                    {suggestedDomains.map((domain) => (
                      <Link
                        onClick={() =>
                          formik.setFieldValue('dataDomain', domain, true)
                        }
                      >
                        {domain}
                      </Link>
                    ))}
                  </Flex>
                )}
                {formik.values.dataDomain && !formik.errors.dataDomain && (
                  <Box>
                    {isReadOnly ? (
                      <Flex css={{ color: '$gray900', gap: '$1' }}>
                        <LockClosedIcon />
                        <Text css={{ color: '$gray900' }}>
                          File permissions will be read-only
                        </Text>
                      </Flex>
                    ) : (
                      <Flex css={{ color: '$gray900', gap: '$1' }}>
                        <Pencil2Icon />
                        <Text css={{ color: '$gray900' }}>
                          File permissions will be read-write
                        </Text>
                      </Flex>
                    )}
                  </Box>
                )}
                {!!defaultPaths.length && (
                  <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                    <Flex css={{ alignItems: 'center' }}>
                      <Text>Add default file paths</Text>
                      <Box css={{ flex: 1 }} />
                      <Checkbox
                        name="addDefaultPaths"
                        size="2"
                        checked={formik.values.addDefaultPaths}
                        onCheckedChange={formik.handleChange}
                      />
                    </Flex>
                    <Code css={{ overflow: 'auto' }}>
                      {defaultPaths.map((path) => (
                        <Box key={path} css={{ margin: '$1 0' }}>
                          {path}
                        </Box>
                      ))}
                    </Code>
                  </Flex>
                )}
              </Fragment>
            )}
          </Flex>
        </Box>
        <Flex css={{ jc: 'flex-end', gap: '$1' }}>
          <Button size="2" variant="ghost" type="button" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            size="2"
            type="submit"
            disabled={!userId || !formik.isValid || formik.isValidating}
          >
            <Box
              css={{
                mr: '$1',
              }}
            >
              {formik.isValidating ? <SpinnerIcon /> : <Pencil2Icon />}
            </Box>
            Save
          </Button>
        </Flex>
      </Flex>
    </form>
  )
}
