import {
  Box,
  Button,
  ControlGroup,
  Flex,
  Text,
  Tooltip,
} from '@riftdweb/design-system'
import { Fragment } from 'react'
import {
  useFs,
  Link,
  useSkynet,
  useUser,
  Avatar,
  SpinnerIcon,
  saveBlobToMachine,
} from '@riftdweb/core'
import { CreateDirectory } from './CreateDirectory'
import { DownloadIcon } from '@radix-ui/react-icons'

export function FileNav() {
  const { myUserId: userId } = useSkynet()
  const user = useUser(userId)
  const profile = user?.profile
  const {
    activeNode,
    activeFile,
    activeNodePath,
    startDownload,
    getDownload,
  } = useFs()

  const download = getDownload(activeNodePath)

  return (
    <Flex css={{ gap: '$1', alignItems: 'center', height: '30px' }}>
      <Avatar userId={userId} profile={profile?.data} link to={'/files'} />
      <Flex
        css={{
          position: 'relative',
          alignItems: 'center',
          gap: '$1',
          overflow: 'hidden',
        }}
      >
        <Link
          to={`/files`}
          css={{
            lineHeight: '24px',
          }}
        >
          {profile?.data.username ||
            profile?.data.firstName ||
            (userId ? `${userId.slice(0, 5)}...` : 'loading...')}
        </Link>
        <Text>/</Text>
        {activeNode.map((name, i) => (
          <Fragment key={name}>
            {i !== 0 && i < activeNode.length && <Text>/</Text>}
            <Link
              to={`/files/${activeNode.slice(0, i + 1).join('/')}`}
              css={{
                lineHeight: '24px',
              }}
            >
              {name}
            </Link>
          </Fragment>
        ))}
      </Flex>
      <Box css={{ flex: 1 }} />
      {activeFile ? (
        <ControlGroup>
          {download.isDownloading ? (
            download.isComplete ? (
              <Tooltip content="Download file">
                <Button
                  size="2"
                  onClick={() =>
                    saveBlobToMachine(activeFile.data.name, download.url)
                  }
                >
                  <DownloadIcon />
                </Button>
              </Tooltip>
            ) : (
              <Tooltip content="Decrypting file">
                <Button size="2" disabled>
                  <SpinnerIcon />
                </Button>
              </Tooltip>
            )
          ) : (
            <Tooltip content="Download file">
              <Button size="2" onClick={() => startDownload(activeFile, true)}>
                <DownloadIcon />
              </Button>
            </Tooltip>
          )}
          <CreateDirectory />
        </ControlGroup>
      ) : activeNode.length > 0 ? (
        <CreateDirectory />
      ) : null}
    </Flex>
  )
}
