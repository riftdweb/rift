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
import React, { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { parseSkylink } from 'skynet-js'
import useLocalStorageState from 'use-local-storage-state'
import { useSelectedPortal } from '../../hooks/useSelectedPortal'
import { uploadDirectory, uploadFile } from '../../shared/skynet'
import { UploadFile } from './UploadFile'

const isValidSkylink = (skylink) => {
  try {
    parseSkylink(skylink) // try to parse the skylink, it will throw on error
  } catch (error) {
    return false
  }

  return true
}

const getFilePath = (file) => file.webkitRelativePath || file.path || file.name

const getRelativeFilePath = (file) => {
  const filePath = getFilePath(file)
  const { root, dir, base } = path.parse(filePath)
  const relative = path
    .normalize(dir)
    .slice(root.length)
    .split(path.sep)
    .slice(1)

  return path.join(...relative, base)
}

const getRootDirectory = (file) => {
  const filePath = getFilePath(file)
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

export function Uploader() {
  const [files, setFiles] = useLocalStorageState('v0/skyfiles', [])
  const [directoryMode, setDirectoryMode] = useState(false)
  const [selectedPortal] = useSelectedPortal()

  useEffect(() => {
    if (directoryMode) {
      inputRef.current.setAttribute('webkitdirectory', 'true')
    } else {
      inputRef.current.removeAttribute('webkitdirectory')
    }
  }, [directoryMode])

  const handleDrop = async (acceptedFiles) => {
    // Make File data serializable
    acceptedFiles = acceptedFiles.map((file) => ({
      name: file.name,
      path: file.path,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      webkitRelativePath: file.webkitRelativePath,
      file,
    }))

    if (directoryMode && acceptedFiles.length) {
      const rootDir = getRootDirectory(acceptedFiles[0]) // get the file path from the first file

      acceptedFiles = [{ name: rootDir, directory: true, files: acceptedFiles }]
    }

    setFiles((previousFiles) => [
      ...acceptedFiles.map((file) => ({ file, status: 'uploading' })),
      ...previousFiles,
    ])

    const onFileStateChange = (file, state) => {
      setFiles((previousFiles) => {
        const index = previousFiles.findIndex((f) => f.file === file)

        return [
          ...previousFiles.slice(0, index),
          {
            ...previousFiles[index],
            ...state,
          },
          ...previousFiles.slice(index + 1),
        ]
      })
    }

    acceptedFiles.forEach((file) => {
      const onUploadProgress = (progress) => {
        const status = progress === 1 ? 'processing' : 'uploading'

        onFileStateChange(file, { status, progress })
      }

      // Reject files larger than our hard limit of 1 GB with proper message
      if (file.size > bytes('1 GB')) {
        onFileStateChange(file, {
          status: 'error',
          error: 'This file size exceeds the maximum allowed size of 1 GB.',
        })

        return
      }

      const upload = async () => {
        try {
          let response

          if (file.directory) {
            const directory = file.files.reduce(
              (acc, file) => ({
                ...acc,
                [getRelativeFilePath(file)]: file.file,
              }),
              {}
            )

            response = await uploadDirectory(
              selectedPortal,
              directory,
              encodeURIComponent(file.name),
              { onUploadProgress }
            )
          } else {
            response = await uploadFile(selectedPortal, file.file, {
              onUploadProgress,
            })
          }

          onFileStateChange(file, {
            status: 'complete',
            skylink: response.skylink,
            uploadedAt: new Date().toISOString(),
            portal: selectedPortal,
          })
        } catch (error) {
          if (
            error.response &&
            error.response.status === StatusCodes.TOO_MANY_REQUESTS
          ) {
            onFileStateChange(file, { progress: -1 })

            return new Promise((resolve) =>
              setTimeout(() => resolve(upload()), 3000)
            )
          }

          onFileStateChange(file, {
            status: 'error',
            error: createUploadErrorMessage(error),
          })
        }
      }

      upload()
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
    <Box>
      <Box className="home-upload-white">
        <Box className="home-upload-split">
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
                  Drop {directoryMode ? 'a directory' : 'files'} here or click
                  to browse. Files will be uploaded to{' '}
                  <Code>{selectedPortal}</Code>. Files will be pinned according
                  to the portal's policies on retention.
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
                    <Flex
                      css={{ gap: '$1' }}
                      onClick={() => setDirectoryMode(false)}
                    >
                      <Text>files</Text>
                      <Radio value="files" />
                    </Flex>
                    <Flex
                      css={{ gap: '$1' }}
                      onClick={() => setDirectoryMode(true)}
                    >
                      <Text>directory</Text>
                      <Radio value="directory" />
                    </Flex>
                  </Flex>
                </RadioGroup>
              </Flex>
            </Flex>
            <Input {...getInputProps()} />
          </Box>
        </Box>

        {files.length > 0 && (
          <Box
            css={{
              margin: '$3 0',
              border: '1px solid $gray500',
              backgroundColor: '$panel',
              borderRadius: '$3',
              overflow: 'hidden',
            }}
          >
            <Flex
              css={{
                padding: '$2 $3',
                gap: '$1',
                borderBottom: '1px solid $gray300',
                color: '$gray900',
                fontSize: '14px',
                height: '44px',
                alignItems: 'center',
              }}
            >
              <Box css={{ width: '15px' }} />
              <Box css={{ flex: 2 }}>File</Box>
              <Box
                css={{
                  flex: 1,
                  display: 'none',
                  when: {
                    bp1: {
                      display: 'block',
                    },
                  },
                }}
              >
                Skylink
              </Box>
              <Box
                css={{
                  flex: 1,
                  display: 'none',
                  when: {
                    bp1: {
                      display: 'block',
                    },
                  },
                }}
              >
                Size
              </Box>
              <Box
                css={{
                  flex: 1,
                  display: 'none',
                  when: {
                    bp2: {
                      display: 'block',
                    },
                  },
                }}
              >
                Ingress
              </Box>
              <Box css={{ flex: 1, textAlign: 'right' }}>Time</Box>
            </Flex>
            {files.map((file, i) => {
              return (
                <UploadFile key={i} selectedPortal={selectedPortal} {...file} />
              )
            })}
          </Box>
        )}
      </Box>
    </Box>
  )
}
