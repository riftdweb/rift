import { Box, Button, Flex, Input, Text } from '@riftdweb/design-system'
import { Fragment, useState } from 'react'
import { useFs } from '../../contexts/files'
import { EntriesState } from '../_shared/EntriesState'
import { Link } from '../_shared/Link'
import { Directory } from './Directory'

export function Files() {
  const {
    directoryIndex,
    createDirectory,
    setActiveDirectory,
    activeDirectory,
  } = useFs()
  const [value, setValue] = useState<string>('')
  console.log(directoryIndex.data)

  return (
    <Box css={{ py: '$3' }}>
      <Flex css={{ gap: '$1', alignItems: 'center' }}>
        <Flex css={{ gap: '$1' }}>
          {activeDirectory.map((name, i) => (
            <Fragment>
              {i !== 0 && i < activeDirectory.length && <Text>/</Text>}
              <Link
                onClick={() =>
                  setActiveDirectory(activeDirectory.slice(0, i + 1))
                }
              >
                {name}
              </Link>
            </Fragment>
          ))}
        </Flex>
        <Box css={{ flex: 1 }} />
        <Box>
          <Input onChange={(e) => setValue(e.target.value)} value={value} />
        </Box>
        <Button onClick={() => createDirectory(value)}>Add</Button>
      </Flex>
      <Box
        css={{
          margin: '$3 0',
          border: '1px solid $gray500',
          backgroundColor: '$panel',
          borderRadius: '$3',
          overflow: 'hidden',
        }}
      >
        <Flex
          css={{
            padding: '$2 $3',
            gap: '$1',
            borderBottom: '1px solid $gray300',
            color: '$gray900',
            fontSize: '14px',
            height: '44px',
            alignItems: 'center',
          }}
        >
          <Box css={{ width: '15px' }} />
          <Box css={{ flex: 2 }}>File</Box>
          <Box
            css={{
              flex: 1,
              display: 'none',
              '@bp1': {
                display: 'block',
              },
            }}
          >
            Skylink
          </Box>
          <Box
            css={{
              flex: 1,
              display: 'none',
              '@bp1': {
                display: 'block',
              },
            }}
          >
            Size
          </Box>
          <Box
            css={{
              flex: 1,
              display: 'none',
              '@bp2': {
                display: 'block',
              },
            }}
          >
            Ingress
          </Box>
          <Box css={{ flex: 1, textAlign: 'right' }}>Time</Box>
        </Flex>
        <EntriesState
          key={activeDirectory.join('/')}
          response={directoryIndex}
          emptyMessage="Folder is empty"
          validatingMessage="Loading folder"
        >
          {directoryIndex.data?.entries.map((file) => (
            <Directory key={file.data.name} file={file} />
          ))}
        </EntriesState>
      </Box>
    </Box>
  )
}
