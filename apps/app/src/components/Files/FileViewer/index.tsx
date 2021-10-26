import { Box, Flex, Text, Tooltip } from '@riftdweb/design-system'
import { Download, FsFile, useFs } from '@riftdweb/core'
import bytes from 'bytes'
import {
  InfoCircledIcon,
  LockClosedIcon,
  QuestionMarkCircledIcon,
} from '@radix-ui/react-icons'
import { Layout } from '../_shared/Layout'
import { AudioViewer } from './AudioViewer'
import { DefaultViewer } from './DefaultViewer'
import { ImageViewer } from './ImageViewer'
import { useEncryptionData } from '../_shared/useEncryptionData'
import { useVersionData } from '../_shared/useVersionData'

export type ViewerProps = {
  file: FsFile
  download: Download
}

export function FileViewer() {
  const { activeFile, activeNodePath, getDownload } = useFs()

  const { mimeType, file } = activeFile.data
  const { size } = file
  const version = useVersionData(activeFile)
  const encryption = useEncryptionData(activeFile)

  const download = getDownload(activeNodePath)

  return (
    <Layout>
      <Flex
        css={{
          gap: '$2',
          padding: '$2 $3',
          borderBottom: '1px solid $gray6',
        }}
      >
        <Tooltip align="start" content={`Size: ${size} bytes`}>
          <Flex css={{ gap: '$1', '&:hover': { color: '$hiContrast' } }}>
            <Text css={{ color: '$gray11' }}>
              {bytes(size, {
                unitSeparator: ' ',
                decimalPlaces: '1',
              })}
            </Text>
          </Flex>
        </Tooltip>
        <Flex css={{ flex: 1 }} />
        <Tooltip content={`Mime type: ${mimeType}`}>
          <Flex css={{ gap: '$1', '&:hover': { color: '$hiContrast' } }}>
            <Box css={{ color: '$gray11' }}>
              <QuestionMarkCircledIcon />
            </Box>
            <Text css={{ color: '$gray11' }}>{mimeType}</Text>
          </Flex>
        </Tooltip>
        <Tooltip content={`Encryption: ${encryption.type}`}>
          <Flex css={{ gap: '$1', '&:hover': { color: '$hiContrast' } }}>
            <Box css={{ color: '$gray11' }}>
              <LockClosedIcon />
            </Box>
            <Text css={{ color: '$gray11' }}>{encryption.label}</Text>
          </Flex>
        </Tooltip>
        <Tooltip align="end" content={`Version: ${version}`}>
          <Flex css={{ gap: '$1', '&:hover': { color: '$hiContrast' } }}>
            <Box css={{ color: '$gray11' }}>
              <InfoCircledIcon />
            </Box>
            <Text css={{ color: '$gray11' }}>{version}</Text>
          </Flex>
        </Tooltip>
      </Flex>
      {activeFile.data.mimeType.startsWith('audio') ? (
        <AudioViewer file={activeFile} download={download} />
      ) : activeFile.data.mimeType.startsWith('image') ? (
        <ImageViewer file={activeFile} download={download} />
      ) : (
        <DefaultViewer file={activeFile} download={download} />
      )}
    </Layout>
  )
}
