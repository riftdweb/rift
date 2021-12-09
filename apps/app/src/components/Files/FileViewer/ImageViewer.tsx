import { Box, Button, Flex, Image } from '@riftdweb/design-system'
import { useBlurHash, useFs } from '@riftdweb/core'
import { ViewerProps } from '.'

export function ImageViewer({ file, download }: ViewerProps) {
  const { startDownload } = useFs()
  const blurUrl = useBlurHash(
    file.data.ext?.thumbnail?.blurHash,
    file.data.ext?.image?.width,
    file.data.ext?.image?.height
  )

  const url = download.url || blurUrl

  return (
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
      {!!url && <Image src={url} css={{ width: '100%' }} />}
      {!download.isDownloading && (
        <Box
          css={{
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button onClick={() => startDownload(file)}>Download</Button>
        </Box>
      )}
    </Flex>
  )
}
