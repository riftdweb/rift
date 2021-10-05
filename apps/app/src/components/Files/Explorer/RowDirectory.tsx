import { Box, Flex } from '@riftdweb/design-system'
import { formatRelative } from 'date-fns'
import { useMemo } from 'react'
import { NodeDirectory, useFs } from '@riftdweb/core/src/contexts/files'
import { Link } from '@riftdweb/core/src/components/_shared/Link'
import { FolderIcon } from '@riftdweb/core/src/components/_icons/FolderIcon'
import { SpinnerIcon } from '@riftdweb/core/src/components/_icons/SpinnerIcon'
import { Row } from './Row'
import { CellText } from './CellText'

type Props = {
  file: NodeDirectory
}

export function DirectoryItem({ file }: Props) {
  const { activePath } = useFs()
  const { pending } = file
  const { name, created } = file.data

  const fsPath = [...activePath, file.data.name].join('/')

  const iconElement = useMemo(() => {
    if (pending) {
      return <SpinnerIcon />
    }
    return <FolderIcon />
  }, [pending])

  return (
    <Row directoryPath={fsPath}>
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
        <CellText />
        <CellText />
        <CellText
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
