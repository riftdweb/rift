import { Box, Flex } from '@riftdweb/design-system'
import { FileIcon } from '@radix-ui/react-icons'
import { formatRelative } from 'date-fns'
import bytes from 'bytes'
import { useMemo } from 'react'
import { Link } from '../../_shared/Link'
import { NodeFile, useFs } from '../../../contexts/files'
import SpinnerIcon from '../../_icons/SpinnerIcon'
import { CellText } from './CellText'
import { Row } from './Row'

type Props = {
  file: NodeFile
}

export function FileItem({ file }: Props) {
  const { activePath } = useFs()
  const { pending } = file
  const {
    name,
    // created,
    modified,
    // history, // map of 'file' objects
    // version,
    mimeType,
  } = file.data
  const {
    // chunkSize,
    // encryptionType,
    // hash,
    // key,
    size,
    // ts,
    // url, // skylink
  } = file.data.file

  const iconElement = useMemo(() => {
    if (pending) {
      return <SpinnerIcon />
    }
    return <FileIcon />
  }, [pending])

  return (
    <Row filePath={''}>
      <Flex
        css={{
          position: 'relative',
          height: '100%',
          padding: '0 $3',
          alignItems: 'center',
          gap: '$1',
        }}
      >
        <Box css={{ color: '$gray900' }}>{iconElement}</Box>
        <Box
          css={{
            flex: 2,
            overflow: 'hidden',
          }}
        >
          <Link
            to={`/files/${[...activePath, file.data.name].join('/')}`}
            css={{
              display: 'block',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              lineHeight: '20px',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'none',
              },
            }}
          >
            {name}
          </Link>
        </Box>
        <CellText>
          {bytes(size, { unitSeparator: ' ', decimalPlaces: '1' })}
        </CellText>
        <CellText>{mimeType}</CellText>
        <CellText
          textCss={{
            textAlign: 'right',
          }}
        >
          {modified && formatRelative(new Date(modified), new Date())}
        </CellText>
      </Flex>
    </Row>
  )
}
