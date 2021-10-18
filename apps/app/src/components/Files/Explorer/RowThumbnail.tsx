import { Box, Flex, Tooltip } from '@riftdweb/design-system'
import { FileIcon } from '@radix-ui/react-icons'
import { Fragment, useMemo } from 'react'
import { FolderIcon, FsNode, SpinnerIcon } from '@riftdweb/core'
import { thumbSize } from './Row'
import { useThumbnail } from '../FileViewer/useThumbnail'

type Props = {
  file: FsNode
}

export function RowThumbnail({ file }: Props) {
  const { status, type } = file

  const thumbElement = useThumbnail(file)

  const loadingElement = useMemo(() => {
    if (!['pending', 'uploading'].includes(status)) {
      return null
    }
    return (
      <Box
        css={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <Tooltip
          align="start"
          content={
            file.type === 'file'
              ? `Uploading${
                  file.upload?.progress
                    ? ` ${(file.upload.progress * 100).toFixed(0)}%`
                    : ''
                }`
              : 'Saving'
          }
        >
          <Flex
            css={{
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <SpinnerIcon />
          </Flex>
        </Tooltip>
      </Box>
    )
  }, [status, file])

  return (
    <Box
      css={{
        position: 'relative',
        color: thumbElement ? 'white' : '$gray900',
        height: `${thumbSize}px`,
        width: `${thumbSize}px`,
        borderRadius: '2px',
        overflow: 'hidden',
      }}
    >
      <Flex
        css={{
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        {thumbElement ? (
          <Fragment>
            {thumbElement}
            {loadingElement}
          </Fragment>
        ) : (
          loadingElement || (type === 'file' ? <FileIcon /> : <FolderIcon />)
        )}
      </Flex>
    </Box>
  )
}
