import { Pencil2Icon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  ControlGroup,
  Flex,
  Input,
  Text,
} from '@riftdweb/design-system'
import { useFormik } from 'formik'
import { useCallback, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import * as Yup from 'yup'
import { useDomains } from '../../../hooks/domains'
import { TreeNodeDirectory } from './KeysTree/transformKeys'

const getFullPath = (treeNode: TreeNodeDirectory, val: string) =>
  treeNode.key ? `${treeNode.key}/${val}` : val

const sanitizePath = (val: string, stripEndSlash: boolean = false) => {
  const val1 = val
    .trim()
    // Prevent user from adding muliple sequential `/`
    .replace(/\/{2,}/g, '/')
    // Prevent user from beginning with a `/`
    .replace(/^\/+/g, '')

  if (stripEndSlash) {
    // Prevent user from ending with a `/`
    return val1.replace(/\/+$/g, '')
  }
  return val1
}

const buildSchema = (treeNode: TreeNodeDirectory, keys: string[]) =>
  Yup.object().shape({
    key: Yup.string()
      .min(1, 'Too Short!')
      .required('Required')
      .notOneOf(keys, 'Name is taken')
      .test(
        'check exists',
        'Name is taken',
        (val) => !keys.includes(getFullPath(treeNode, val))
      ),
  })

type Props = {
  treeNode: TreeNodeDirectory
  closeDialog: () => void
}

export function AddKeyForm({ treeNode, closeDialog }: Props) {
  const history = useHistory()
  const { addKey } = useDomains()
  const { domain } = treeNode

  const onSubmit = useCallback(
    (vals) => {
      const cleanKey = sanitizePath(vals.key, true)
      const fullKey = treeNode.key ? `${treeNode.key}/${cleanKey}` : cleanKey
      const newKey = {
        id: fullKey,
        key: fullKey,
      }
      if (addKey(domain.id, newKey)) {
        formik.resetForm()
        closeDialog()
        history.push(
          `/data/${encodeURIComponent(domain.name)}/${encodeURIComponent(
            newKey.key
          )}`
        )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, domain, addKey, closeDialog, treeNode]
  )

  const existingKeys = useMemo(() => domain.keys.map((key) => key.key), [
    domain,
  ])

  const validationSchema = useMemo(() => buildSchema(treeNode, existingKeys), [
    treeNode,
    existingKeys,
  ])

  const formik = useFormik({
    initialValues: {
      key: '',
    },
    validationSchema,
    onSubmit,
  })

  const setNewKey = useCallback(
    (val) => {
      const cleanVal = sanitizePath(val)
      formik.setFieldValue('key', cleanVal, true)
    },
    [formik]
  )

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
            <Flex css={{ flexDirection: 'column', gap: '$2' }}>
              <Flex>
                {formik.errors.key && (
                  <Text css={{ color: '$red900', flex: 1, textAlign: 'right' }}>
                    {formik.errors.key}
                  </Text>
                )}
              </Flex>
              <ControlGroup>
                <Button type="button" disabled size="2">
                  {treeNode.fullKey.length > 20
                    ? `...${treeNode.fullKey.slice(
                        -20,
                        treeNode.fullKey.length
                      )}`
                    : treeNode.fullKey}
                  /
                </Button>
                <Input
                  name="key"
                  value={formik.values.key}
                  onChange={(e) => setNewKey(e.target.value)}
                  size="3"
                  placeholder="path.json"
                  css={{
                    boxShadow:
                      'inset 0 0 0 1px var(--colors-blue500), inset 0 0 0 100px var(--colors-blue200) !important',
                  }}
                />
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
