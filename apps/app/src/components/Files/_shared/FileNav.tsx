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
  Avatar,
  SpinnerIcon,
  saveBlobToMachine,
} from '@riftdweb/core'
import { CreateDirectory } from './CreateDirectory'
import {
  DownloadIcon,
  EyeOpenIcon,
  Pencil1Icon,
  Share1Icon,
} from '@radix-ui/react-icons'
import { useSharingData } from './useSharingData'
import { copyToClipboardCustom } from '@riftdweb/core'

export function FileNav() {
  const { myUserId: userId } = useSkynet()
  const {
    activeNode,
    activeNodeOwner,
    isActiveNodeReadOnly,
    isActiveNodeReadWrite,
    isActiveNodeShared,
    activeFile,
    activeNodePath,
    startDownload,
    getDownload,
  } = useFs()
  const download = getDownload(activeNodePath)

  const { shareReadLink } = useSharingData()

  const profile = activeNodeOwner?.profile

  // If shared directory, do not render root part
  const displayNodeStartIndex = isActiveNodeShared ? 1 : 0

  const mainTo = isActiveNodeShared ? `/files/${activeNode[0]}` : '/files/home'

  const tooltipContent = isActiveNodeShared
    ? `Shared directory: ${isActiveNodeReadWrite ? 'Editor' : 'View only'}`
    : 'Your directory'

  const shareButtonElement = (
    <Tooltip content="Share directory">
      <Button
        size="2"
        onClick={() =>
          copyToClipboardCustom(
            shareReadLink,
            <Flex css={{ flexDirection: 'column', gap: '$2' }}>
              <Text css={{ fontWeight: 600 }}>
                Copied sharing link to clipboard.
              </Text>
              <Box css={{ borderBottom: '1px solid $yellow5' }} />
              <Text css={{ lineHeight: '20px' }}>
                Careful! Once you share this link the encrypted directory is no
                longer fully private!
              </Text>
            </Flex>,
            { type: 'warning', autoClose: 10_000 }
          )
        }
      >
        <Share1Icon />
      </Button>
    </Tooltip>
  )

  return (
    <Flex
      css={{
        position: 'relative',
        gap: '$1',
        alignItems: 'center',
        height: '30px',
      }}
    >
      <Tooltip align="start" content={tooltipContent}>
        <Box css={{ position: 'relative' }}>
          {isActiveNodeShared && (
            <Box
              css={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                zIndex: 1,
                transform: 'scale(0.75)',
                backgroundColor: '$loContrast',
                borderRadius: '$round',
                border: '2px solid $gray7',
                padding: '3px',
                color: '$hiContrast',
              }}
            >
              {isActiveNodeReadOnly && <EyeOpenIcon />}
              {isActiveNodeReadWrite && <Pencil1Icon />}
            </Box>
          )}
          <Avatar userId={userId} profile={profile?.data} link to={mainTo} />
        </Box>
      </Tooltip>
      <Flex
        css={{
          position: 'relative',
          alignItems: 'center',
          gap: '$1',
          overflow: 'hidden',
        }}
      >
        <Link
          to={mainTo}
          css={{
            lineHeight: '24px',
          }}
        >
          {profile?.data.username ||
            profile?.data.firstName ||
            (userId ? `${userId.slice(0, 5)}...` : 'loading...')}
        </Link>
        <Text>/</Text>
        {activeNode.slice(displayNodeStartIndex).map((name, i) => (
          <Fragment key={name}>
            {i !== 0 && i < activeNode.length && <Text>/</Text>}
            <Link
              to={`/files/${activeNode
                .slice(0, i + 1 + displayNodeStartIndex)
                .join('/')}`}
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
        download.isDownloading ? (
          download.isComplete ? (
            <Tooltip content="Save to device">
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
            <Tooltip content="Downloading">
              <Button size="2" disabled>
                <SpinnerIcon />
              </Button>
            </Tooltip>
          )
        ) : (
          <Tooltip content="Download and save to device">
            <Button size="2" onClick={() => startDownload(activeFile, true)}>
              <DownloadIcon />
            </Button>
          </Tooltip>
        )
      ) : activeNode.length > 0 ? (
        isActiveNodeReadOnly ? (
          shareButtonElement
        ) : (
          <ControlGroup>
            <CreateDirectory />
            {shareButtonElement}
          </ControlGroup>
        )
      ) : null}
    </Flex>
  )
}
