import { Box, Button, Flex, Text } from '@riftdweb/design-system'
import { FileIcon } from '@radix-ui/react-icons'
import { Download, FsFile, useFs } from '@riftdweb/core'

const coverSize = 200

type Props = {
  file: FsFile
  download: Download
  children?: React.ReactNode
}

export function CoverArea({ file, download, children }: Props) {
  const { startDownload } = useFs()

  return (
    <Flex
      css={{
        width: '100%',
        height: '400px',
        gap: '$4',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <Box
        css={{
          position: 'relative',
          color: '$gray11',
          height: `${coverSize}px`,
          width: `${coverSize}px`,
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        {children || (
          <Flex
            css={{
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              transform: 'scale(5)',
            }}
          >
            <FileIcon />
          </Flex>
        )}
      </Box>
      {download.isDownloading ? (
        download.progress < 1 && (
          <Flex css={{ gap: '$1' }}>
            <Text>
              Downloading {`${(download.progress * 100).toFixed(0)}%`}
            </Text>
          </Flex>
        )
      ) : (
        <Box>
          <Button onClick={() => startDownload(file)}>Download</Button>
        </Box>
      )}
    </Flex>
  )
}
