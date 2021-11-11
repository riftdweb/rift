import { TriangleDownIcon, TriangleUpIcon } from '@radix-ui/react-icons'
import { useFs } from '@riftdweb/core'
import { Box, Flex } from '@riftdweb/design-system'
import { CellText } from './CellText'

export function Header() {
  const { sortKey, sortDir, toggleSort } = useFs()
  return (
    <Flex
      css={{
        padding: '$2 $3',
        gap: '$1',
        borderBottom: '1px solid $gray4',
        color: '$gray11',
        fontSize: '14px',
        height: '44px',
        alignItems: 'center',
      }}
    >
      <Box css={{ width: '15px' }} />
      <CellText
        onClick={() => toggleSort('data.name')}
        textCss={{
          fontWeight: sortKey === 'data.name' ? 500 : 400,
          color: sortKey === 'data.name' ? '$hiContrast' : '$gray11',
        }}
        css={{
          flex: 2,
        }}
        icon={
          sortKey === 'data.name' &&
          (sortDir === 'asc' ? <TriangleDownIcon /> : <TriangleUpIcon />)
        }
      >
        Name
      </CellText>
      <CellText
        onClick={() => toggleSort('data.size')}
        css={{
          display: 'none',
          '@bp2': {
            display: 'flex',
          },
        }}
        textCss={{
          fontWeight: sortKey === 'data.size' ? 500 : 400,
          color: sortKey === 'data.size' ? '$hiContrast' : '$gray11',
        }}
        icon={
          sortKey === 'data.size' &&
          (sortDir === 'asc' ? <TriangleDownIcon /> : <TriangleUpIcon />)
        }
      >
        Size
      </CellText>
      <CellText
        onClick={() => toggleSort('data.type')}
        css={{
          display: 'none',
          '@bp2': {
            display: 'flex',
          },
        }}
        textCss={{
          fontWeight: sortKey === 'data.type' ? 500 : 400,
          color: sortKey === 'data.type' ? '$hiContrast' : '$gray11',
        }}
        icon={
          sortKey === 'data.type' &&
          (sortDir === 'asc' ? <TriangleDownIcon /> : <TriangleUpIcon />)
        }
      >
        Type
      </CellText>
      <CellText
        flex={1}
        css={{
          display: 'none',
          '@bp2': {
            display: 'flex',
          },
        }}
        onClick={() => toggleSort('data.file.encryptionType')}
        textCss={{
          fontWeight: sortKey === 'data.file.encryptionType' ? 500 : 400,
          color:
            sortKey === 'data.file.encryptionType' ? '$hiContrast' : '$gray11',
        }}
        icon={
          sortKey === 'data.file.encryptionType' &&
          (sortDir === 'asc' ? <TriangleDownIcon /> : <TriangleUpIcon />)
        }
      >
        Encryption
      </CellText>
      <CellText
        css={{
          display: 'none',
          '@bp2': {
            display: 'flex',
          },
        }}
        onClick={() => toggleSort('data.modified')}
        textCss={{
          textAlign: 'right',
          fontWeight: sortKey === 'data.modified' ? 500 : 400,
          color: sortKey === 'data.modified' ? '$hiContrast' : '$gray11',
        }}
        icon={
          sortKey === 'data.modified' &&
          (sortDir === 'asc' ? <TriangleDownIcon /> : <TriangleUpIcon />)
        }
      >
        Last updated
      </CellText>
    </Flex>
  )
}
