import { Badge, Box, Flex, Tooltip } from '@riftdweb/design-system'
import { formatRelative } from 'date-fns'
import bytes from 'bytes'
import { Link, FsFile, useFs } from '@riftdweb/core'
import { CellText } from './CellText'
import { Row } from './Row'
import { RowThumbnail } from './RowThumbnail'
import { useEncryptionData } from '../_shared/useEncryptionData'
import { useVersionData } from '../_shared/useVersionData'

type Props = {
  file: FsFile
}

export function FileItem({ file }: Props) {
  const { activeNode } = useFs()
  const { name, modified, mimeType } = file.data
  const { size } = file.data.file

  const backgroundColor =
    file.status === undefined
      ? 'inherit'
      : file.status === 'complete'
      ? '$green3'
      : '$green2'

  const version = useVersionData(file)
  const encryption = useEncryptionData(file)

  return (
    <Row>
      {!!file.upload?.progress && (
        <Box
          css={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: '100%',
            backgroundColor,
            width: `${file.upload.progress * 100}%`,
          }}
        />
      )}
      <Flex
        css={{
          position: 'relative',
          height: '100%',
          padding: '0 $3',
          alignItems: 'center',
          gap: '$1',
        }}
      >
        <RowThumbnail file={file} />
        <Box
          css={{
            flex: 2,
            overflow: 'hidden',
          }}
        >
          <Link
            to={`/files/${[...activeNode, file.data.name].join('/')}`}
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
            {version > 1 && (
              <Tooltip content={`Version ${version}`}>
                <Badge css={{ ml: '$1' }}>v{version}</Badge>
              </Tooltip>
            )}
          </Link>
        </Box>
        <CellText>
          {bytes(size, { unitSeparator: ' ', decimalPlaces: '1' })}
        </CellText>
        <CellText>{mimeType}</CellText>
        <Box css={{ flex: 1, color: '$gray11' }}>
          <Tooltip content={`Encryption: ${encryption.type}`}>
            <Badge>{encryption.label}</Badge>
          </Tooltip>
        </Box>
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
