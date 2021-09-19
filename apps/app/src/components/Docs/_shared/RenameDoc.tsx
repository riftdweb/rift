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
import * as Yup from 'yup'
import { useDocs } from '../../../contexts/docs'
import SpinnerIcon from '../../_icons/SpinnerIcon'

const buildSchema = () =>
  Yup.object().shape({
    name: Yup.string()
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required'),
  })

export function RenameDoc({ docId, name, closeEditing }) {
  const { renameDoc } = useDocs()

  const onSubmit = useCallback(
    (vals): Promise<void> => {
      const func = async () => {
        const success = await renameDoc(docId, vals.name)
        if (success) {
          formik.resetForm()
          closeEditing()
        }
      }
      return func()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [renameDoc, closeEditing]
  )

  const validationSchema = useMemo(() => buildSchema(), [])

  const formik = useFormik({
    initialValues: {
      name,
    },
    validationSchema,
    onSubmit,
  })

  return (
    <Box as="form" onSubmit={formik.handleSubmit} css={{ flex: '1' }}>
      <Flex
        css={{
          flexDirection: 'column',
          gap: '$3',
        }}
      >
        <Flex css={{ gap: '$1' }}>
          <Input
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            size="3"
            placeholder={'my new document'}
            css={{
              fontSize: '$7',
              fontWeight: '500',
            }}
          />
          <Box css={{ flex: 1 }} />
          <ControlGroup>
            <Button
              size="2"
              variant="ghost"
              type="button"
              onClick={closeEditing}
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
          </ControlGroup>
        </Flex>
        <Flex>
          {formik.errors.name && (
            <Text css={{ color: '$red900', flex: 1 }}>
              {formik.errors.name}
            </Text>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}
