import { Box } from '@riftdweb/design-system'
import { useFs, EntriesState } from '@riftdweb/core'
import { DirectoryItem } from './RowDirectory'
import { FileItem } from './RowFile'
import { Layout } from '../_shared/Layout'
import { Header } from './Header'
import { Drop } from './Drop'

export function FileExplorer() {
  const {
    activeNodePath,
    activeDirectoryPath,
    sortedIndex,
    isActiveNodeShared,
  } = useFs()

  return (
    <Layout>
      <Drop directoryPath={activeDirectoryPath} disabled={isActiveNodeShared}>
        <Box
          css={{
            position: 'relative',
          }}
        >
          <Header />
          <EntriesState
            key={activeNodePath}
            response={sortedIndex}
            emptyMessage="Folder is empty"
            validatingMessage=""
          >
            {sortedIndex.data?.entries.map((file) =>
              file.type === 'directory' ? (
                <DirectoryItem key={file.data.name} file={file} />
              ) : (
                <FileItem key={file.data.name} file={file} />
              )
            )}
          </EntriesState>
        </Box>
      </Drop>
    </Layout>
  )
}
