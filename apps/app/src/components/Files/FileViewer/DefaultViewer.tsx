import { Box, Flex } from '@riftdweb/design-system'
import { ViewerProps } from '.'
import { CoverArea } from './CoverArea'

export function DefaultViewer({ file, download }: ViewerProps) {
  const { url } = download

  return url ? (
    <Flex
      css={{
        width: '100%',
        minHeight: '400px',
        gap: '$4',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {file.data.mimeType.startsWith('image') ? (
        <Box as="img" src={url} css={{ width: '100%' }} />
      ) : file.data.mimeType.startsWith('video') ? (
        <Box as="video" controls autoPlay css={{ width: '100%' }}>
          <source src={url} type="video/mp4" />
        </Box>
      ) : ['application/pdf'].includes(file.data.mimeType) ? (
        <Box css={{ width: '100%', height: '100vh' }}>
          <embed src={url} width="100%" height="100%" />
        </Box>
      ) : file.data.mimeType.startsWith('audio') ? (
        <Box as="audio" controls css={{ width: '70%' }}>
          <source src={url} type={file.data.mimeType} />
        </Box>
      ) : (
        <CoverArea file={file} download={download} />
      )}
    </Flex>
  ) : (
    <CoverArea file={file} download={download} />
  )
}
