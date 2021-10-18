import { Box, Button, Flex, Text } from '@riftdweb/design-system'
import { FileIcon } from '@radix-ui/react-icons'
import { useMusicCover } from './useMusicCover'
import { ViewerProps } from '.'
import { useFs } from '@riftdweb/core'

const coverSize = 200
const iconSize = 200

export function AudioViewer({ file, download }: ViewerProps) {
  const { startDownload } = useFs()
  const coverElement = useMusicCover(file, coverSize)

  const size = coverElement ? coverSize : iconSize

  const { title, artist, album, date } = file.data.ext?.audio || {}

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
          color: '$gray900',
          height: `${size}px`,
          width: `${size}px`,
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        {coverElement || (
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
      <Flex
        css={{
          flexDirection: 'column',
          gap: '$2',
          textAlign: 'center',
        }}
      >
        <Text>{title || file.data.name}</Text>
        {(artist || album) && (
          <Flex css={{ gap: '$1' }}>
            {artist && <Text css={{ color: '$gray700' }}>{artist}</Text>}
            {artist && album && <Text css={{ color: '$gray700' }}>-</Text>}
            {album && (
              <Text css={{ color: '$gray700' }}>
                {`${album}${date ? ` (${date})` : ''}`}
              </Text>
            )}
          </Flex>
        )}
      </Flex>
      {download.isDownloading ? (
        download.isComplete ? (
          <Box as="audio" controls css={{ width: '70%' }}>
            <source src={download.url} type={file.data.mimeType} />
          </Box>
        ) : (
          <Text>{`${(download.progress * 100).toFixed(0)}%`}</Text>
        )
      ) : (
        <Box>
          <Button onClick={() => startDownload(file)}>
            Download and play
          </Button>
        </Box>
      )}
    </Flex>
  )
}
