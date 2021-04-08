import {
  Box,
  Code,
  Container,
  Flex,
  Input,
  Radio,
  RadioGroup,
  Subheading,
  Text,
} from '@modulz/design-system'
import bytes from 'bytes'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import path from 'path-browserify'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { v4 as uuid } from 'uuid'
import { useSelectedPortal } from '../../hooks/useSelectedPortal'
import { uploadDirectory, uploadFile } from '../../shared/skynet'
import { Upload, UploadFile } from '../../shared/types'
import { getSize } from '../../shared/uploads'

const getFilePath = (uploadFile: UploadFile): string =>
  uploadFile.webkitRelativePath || uploadFile.path || uploadFile.name

const getRelativeFilePath = (uploadFile: UploadFile): string => {
  const filePath = getFilePath(uploadFile)
  const { root, dir, base } = path.parse(filePath)
  const relative = path
    .normalize(dir)
    .slice(root.length)
    .split(path.sep)
    .slice(1)

  return path.join(...relative, base)
}

const getRootDirectory = (uploadFile: UploadFile): string => {
  const filePath = getFilePath(uploadFile)
  const { root, dir } = path.parse(filePath)

  return path.normalize(dir).slice(root.length).split(path.sep)[0]
}

const createUploadErrorMessage = (error) => {
  // The request was made and the server responded with a status code that falls out of the range of 2xx
  if (error.response) {
    if (error.response.data.message) {
      return `Upload failed with error: ${error.response.data.message}`
    }

    const statusCode = error.response.status
    const statusText = getReasonPhrase(error.response.status)

    return `Upload failed, our server received your request but failed with status code: ${statusCode} ${statusText}`
  }

  // The request was made but no response was received. The best we can do is detect whether browser is online.
  // This will be triggered mostly if the server is offline or misconfigured and doesn't respond to valid request.
  if (error.request) {
    if (!navigator.onLine) {
      return 'You are offline, please connect to the internet and try again'
    }

    // TODO: We should add a note 'our team has been notified' and have some kind of notification with this error.
    return 'Server failed to respond to your request, please try again later.'
  }

  // TODO: We should add a note 'our team has been notified' and have some kind of notification with this error.
  return `Critical error, please refresh the application and try again. ${error.message}`
}

type Props = {
  addUploads: (uploads: Upload[]) => void
  updateUpload: (state: Partial<Upload>) => void
}

export function Uploader({ addUploads, updateUpload }: Props) {
  const [directoryMode, setDirectoryMode] = useState(false)
  const [selectedPortal] = useSelectedPortal()

  useEffect(() => {
    if (directoryMode) {
      inputRef.current.setAttribute('webkitdirectory', 'true')
    } else {
      inputRef.current.removeAttribute('webkitdirectory')
    }
  }, [directoryMode])

  const handleDrop = async (droppedFiles) => {
    // Make File data serializable
    let newUploadFiles: UploadFile[] = droppedFiles.map((file) => ({
      name: file.name,
      path: file.path,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      webkitRelativePath: file.webkitRelativePath,
      file,
    }))

    // get the file path from the first file
    const rootDir = getRootDirectory(newUploadFiles[0])

    // Files dropped without a directory
    if (directoryMode && rootDir === '.') {
      return
    }

    // Warning: dropping multiple directories is possible and has wonky behaviour
    // File picker does not allow, otherwise no general way to handle.
    // Maybe check for whether root Dirs variations is greater than 1?

    let newUploads: Upload[] =
      directoryMode && newUploadFiles.length
        ? [
            {
              id: uuid(),
              status: 'uploading',
              uploadDirectory: {
                name: rootDir,
                uploadFiles: newUploadFiles,
              },
            },
          ]
        : newUploadFiles.map((uploadFile) => ({
            id: uuid(),
            status: 'uploading',
            uploadFile,
          }))

    addUploads(newUploads)

    const onFileStateChange = (upload, state) => {
      updateUpload({
        ...state,
        id: upload.id,
      })
    }

    newUploads.forEach((upload: Upload) => {
      const onUploadProgress = (progress) => {
        const status = progress === 1 ? 'processing' : 'uploading'

        onFileStateChange(upload, { status, progress })
      }

      // Reject files larger than our hard limit of 1 GB with proper message
      if (getSize(upload) > bytes('1 GB')) {
        onFileStateChange(upload, {
          status: 'error',
          error: 'This upload size exceeds the maximum allowed size of 1 GB.',
        })

        return
      }

      const startUpload = async () => {
        try {
          let response

          // Set the portal before upload initiates
          onFileStateChange(upload, {
            portal: selectedPortal,
          })

          if (upload.uploadDirectory) {
            const directory = upload.uploadDirectory.uploadFiles.reduce(
              (acc, uploadFile: UploadFile) => ({
                ...acc,
                [getRelativeFilePath(uploadFile)]: uploadFile.file,
              }),
              {}
            )

            response = await uploadDirectory(
              selectedPortal,
              directory,
              encodeURIComponent(upload.uploadDirectory.name),
              { onUploadProgress }
            )
          } else {
            response = await uploadFile(
              selectedPortal,
              upload.uploadFile.file,
              {
                onUploadProgress,
              }
            )
          }

          onFileStateChange(upload, {
            status: 'complete',
            skylink: response.skylink,
            uploadedAt: new Date().toISOString(),
          })
        } catch (error) {
          if (
            error.response &&
            error.response.status === StatusCodes.TOO_MANY_REQUESTS
          ) {
            onFileStateChange(upload, { progress: -1 })

            return new Promise((resolve) =>
              setTimeout(() => resolve(startUpload()), 3000)
            )
          }

          onFileStateChange(upload, {
            status: 'error',
            error: createUploadErrorMessage(error),
          })
        }
      }

      startUpload()
    })
  }

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: handleDrop,
  })

  const stopPropagation = useCallback((e) => {
    e.stopPropagation()
  }, [])

  const toggleDirectoryModeRadio = useCallback(
    (e) => {
      setDirectoryMode(e.target.value === 'directory')
    },
    [setDirectoryMode]
  )

  return (
    <Box
      css={{
        border: '1px dashed $gray500',
        borderRadius: '$3',
        overflow: 'hidden',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '$gray100',
          transition: 'all .1s',
        },
      }}
    >
      <Flex
        css={{
          height: '200px',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          outline: 'none',
          '&:hover': {
            backgroundcolor: 'rgba(0, 0, 0, 0.03)',
            cursor: 'pointer',
          },
          ...(isDragActive
            ? {
                backgroundColor: '$blue100',
                border: '1px solid $blue500',
              }
            : {}),
        }}
        {...getRootProps()}
      >
        <Subheading>
          Upload {directoryMode ? 'a directory' : 'files'}
        </Subheading>
        <Container size="1">
          <Text
            size="3"
            css={{
              color: '$gray900',
              margin: '$1 0 $3',
              lineHeight: '22px',
            }}
          >
            Drop {directoryMode ? 'a directory' : 'files'} here or click to
            browse. Files will be uploaded to <Code>{selectedPortal}</Code>.
            Files will be pinned according to the portal's policies on
            retention.
          </Text>
        </Container>
        <Flex css={{ gap: '$3', alignItems: 'center' }}>
          <RadioGroup
            value={directoryMode ? 'directory' : 'files'}
            onClick={stopPropagation}
            onChange={toggleDirectoryModeRadio}
            defaultValue={directoryMode ? 'directory' : 'files'}
          >
            <Flex css={{ gap: '$2' }}>
              <Flex css={{ gap: '$1' }} onClick={() => setDirectoryMode(false)}>
                <Text>files</Text>
                <Radio value="files" />
              </Flex>
              <Flex css={{ gap: '$1' }} onClick={() => setDirectoryMode(true)}>
                <Text>directory</Text>
                <Radio value="directory" />
              </Flex>
            </Flex>
          </RadioGroup>
        </Flex>
      </Flex>
      <Input {...getInputProps()} />
    </Box>
  )
}
