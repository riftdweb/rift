import { Container, Box, Flex } from '@riftdweb/design-system'
import { useFs } from '@riftdweb/core/src/contexts/files'
import { EntriesState } from '@riftdweb/core/src/components/_shared/EntriesState'
import { DirectoryItem } from './RowDirectory'
import { FileItem } from './RowFile'
import { FileNav } from './FileNav'
import { Header } from './Header'
import { Drop } from './Drop'

export function FileExplorer() {
  const { activePath, directoryIndex } = useFs()

  return (
    <Container size="3" css={{ py: '$5' }}>
      <Flex css={{ flexDirection: 'column', gap: '$5' }}>
        <Box>
          <FileNav />
          <Box
            css={{
              position: 'relative',
              margin: '$3 0',
              border: '1px solid $gray500',
              backgroundColor: '$panel',
              borderRadius: '$3',
              // overflow: 'hidden',
            }}
          >
            <Drop directoryPath="/">
              <Box
                css={{
                  position: 'relative',
                }}
              >
                <Header />
                <EntriesState
                  key={activePath.join('/')}
                  response={directoryIndex}
                  emptyMessage="Folder is empty"
                  validatingMessage="Loading folder"
                >
                  {directoryIndex.data?.entries.map((file) =>
                    file.type === 'directory' ? (
                      <DirectoryItem key={file.data.name} file={file} />
                    ) : (
                      <FileItem key={file.data.name} file={file} />
                    )
                  )}
                </EntriesState>
              </Box>
            </Drop>
          </Box>
        </Box>
      </Flex>
    </Container>
  )
}
