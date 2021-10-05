import { Container, Box, Flex, Text, Card } from '@riftdweb/design-system'
import { Fragment, useEffect, useState } from 'react'
import { useFs } from '@riftdweb/core/src/contexts/files'
import { Link } from '@riftdweb/core/src/components/_shared/Link'
import { getFileUrl } from './download'

export function FileViewer() {
  const { activePath, activeFile } = useFs()

  // eslint-disable-next-line
  const [url, setUrl] = useState<string>('')

  useEffect(() => {
    const func = async () => {
      const url = await getFileUrl(activeFile.data)
      setUrl(url)
    }
    func()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Container size="3" css={{ py: '$5' }}>
      <Flex css={{ gap: '$1', alignItems: 'center' }}>
        <Flex css={{ gap: '$1' }}>
          {activePath.map((name, i) => (
            <Fragment>
              {i !== 0 && i < activePath.length && <Text>/</Text>}
              <Link to={`/files/${activePath.slice(0, i + 1).join('/')}`}>
                {name}
              </Link>
            </Fragment>
          ))}
        </Flex>
        <Box css={{ flex: 1 }} />
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
        {/* {!url && ( */}
        <Card>
          <Text>{activeFile.data.name}</Text>
          <Text>{activeFile.data.mimeType}</Text>
          <Text>Version {activeFile.data.version + 1}</Text>
          <Text>{activeFile.data.file.encryptionType}</Text>
          <Text>{activeFile.data.file.size}</Text>
        </Card>
        {/* )} */}
        {/* {url && activeFile.data.mimeType.startsWith('image') && (
          <img src={url} />
        )}
        {url && activeFile.data.mimeType.startsWith('video') && (
          <Box as="video" controls autoPlay css={{ width: '100%' }}>
            <source src={url} type="video/mp4" />
          </Box>
        )}
        {url && ['application/pdf'].includes(activeFile.data.mimeType) && (
          <Box css={{ width: '100%', height: '100vh' }}>
            <embed src={url} width="100%" height="100%" />
          </Box>
        )}
        {url && activeFile.data.mimeType.startsWith('audio') && (
          <Box as="audio" controls css={{ width: '100%' }}>
            <source src={url} type={activeFile.data.mimeType} />
          </Box>
        )} */}
      </Box>
    </Container>
  )
}
