import { Box, Flex } from '@riftdweb/design-system'
import { formatRelative } from 'date-fns'
import { FsDirectory, useFs, Link } from '@riftdweb/core'
import { Row } from './Row'
import { CellText } from './CellText'
import { RowThumbnail } from './RowThumbnail'

type Props = {
  file: FsDirectory
}

export function DirectoryItem({ file }: Props) {
  const { activeNode, isActiveNodeShared } = useFs()
  const { name, created } = file.data

  const fsPath = [...activeNode, file.data.name].join('/')

  return (
    <Row directoryPath={fsPath} dropDisabled={isActiveNodeShared}>
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
            to={`/files/${fsPath}`}
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
        <CellText
          css={{
            display: 'none',
            '@bp2': {
              display: 'block',
            },
          }}
        />
        <CellText
          css={{
            display: 'none',
            '@bp2': {
              display: 'block',
            },
          }}
        />
        <CellText
          css={{
            display: 'none',
            '@bp2': {
              display: 'block',
            },
          }}
          flex={0.75}
        />
        <CellText
          css={{
            display: 'none',
            '@bp2': {
              display: 'block',
            },
          }}
          textCss={{
            textAlign: 'right',
          }}
        >
          {created && formatRelative(new Date(created), new Date())}
        </CellText>
      </Flex>
    </Row>
  )
}
