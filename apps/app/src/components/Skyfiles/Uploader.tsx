import {
  Box,
  Code,
  Container,
  Flex,
  TextField,
  Radio,
  RadioGroup,
  Heading,
  Text,
} from '@riftdweb/design-system'
import { Skyfile } from '@riftdweb/types'
import { TaskQueue } from '@riftdweb/queue'
import bytes from 'bytes'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import values from 'lodash/values'
import path from 'path-browserify'
import { useCallback, useEffect } from 'react'
import { useBeforeunload } from 'react-beforeunload'
import { useDropzone } from 'react-dropzone'
import useLocalStorageState from 'use-local-storage-state'
import { v4 as uuid } from 'uuid'
import { useSkynet, usePortal, getSize } from '@riftdweb/core'

const taskQueue = TaskQueue('uploads', {
  poolSize: 5,
})

const getRelativeFilePath = (filepath: string): string => {
  const { root, dir, base } = path.parse(filepath)
  const relative = path
    .normalize(dir)
    .slice(root.length)
    .split(path.sep)
    .slice(1)

  return path.join(...relative, base)
}

const getRootDirectory = (skyfile: Skyfile): string => {
  const { root, dir } = path.parse(skyfile.metadata!.path)

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

    return 'Server failed to respond to your request, please try again later.'
  }

  return `Critical error, please refresh the application and try again. ${error.message}`
}

const UPLOAD_STATE_CACHE = {}
// window.UPLOAD_STATE_CACHE = UPLOAD_STATE_CACHE

type Props = {
  addSkyfiles: (skyfiles: Skyfile[]) => void
  updateSkyfile: (id: string, state: Partial<Skyfile>) => void
  updateSkyfileUpload: (id: string, state: Partial<Skyfile['upload']>) => void
  areUploadsInProgress: boolean
}

export function Uploader({
  addSkyfiles,
  updateSkyfile,
  updateSkyfileUpload,
  areUploadsInProgress,
}: Props) {
  const [directoryMode, setDirectoryMode] = useLocalStorageState<boolean>(
    'directoryMode',
    false
  )
  const { portal } = usePortal()
  const { Api } = useSkynet()

  useBeforeunload((e) => {
    if (areUploadsInProgress) {
      e.preventDefault()
    }
  })

  const handleDrop = async (droppedFiles) => {
    // Make File data serializable
    let newUploadFiles: Skyfile[] = droppedFiles.map((file) => ({
      id: uuid(),
      contentType: file.type,
      metadata: {
        filename: file.name,
        length: file.size,
        subfiles: {
          [file.name]: {
            contenttype: file.type,
            filename: file.name,
            len: file.size,
            path: file.path,
          },
        },
        lastModified: file.lastModified,
        path: file.webkitRelativePath || file.path || file.name,
      },
      skylink: '',
      isDirectory: false,
      upload: {
        status: 'uploading',
        uploadedAt: undefined,
        updatedAt: new Date().toISOString(),
        ingressPortals: [],
        progress: undefined,
        error: undefined,
      },
      fileHandle: file,
    }))

    // get the file path from the first file
    const rootDir = getRootDirectory(newUploadFiles[0])

    // Files dropped without a directory
    if (directoryMode && rootDir === '.') {
      alert('Directory mode is selected and dropped files are not a directory.')
      return
    }

    // Warning: dropping multiple directories is possible and has wonky behaviour
    // File picker does not allow, otherwise no general way to handle.
    // Maybe check for whether root Dirs variations is greater than 1?

    let newSkyfiles: Skyfile[] =
      directoryMode && newUploadFiles.length
        ? [
            {
              id: uuid(),
              contentType: newUploadFiles.find(
                (skyfile) => skyfile.metadata.filename === 'index.html'
              )
                ? 'text/html'
                : 'application/zip',
              metadata: {
                filename: rootDir,
                length: newUploadFiles.reduce(
                  (acc, skyfile) => acc + skyfile.metadata.length,
                  0
                ),
                subfiles: newUploadFiles.reduce(
                  (acc, skyfile) => ({
                    ...acc,
                    [skyfile.metadata.path]: {
                      contenttype: skyfile.contentType,
                      filename: skyfile.metadata.filename,
                      len: skyfile.metadata.length,
                      path: skyfile.metadata.path,
                      fileHandle: skyfile.fileHandle,
                    },
                  }),
                  {}
                ),
              },
              skylink: '',
              isDirectory: true,
              upload: {
                status: 'uploading',
                uploadedAt: undefined,
                updatedAt: new Date().toISOString(),
                ingressPortals: [],
                progress: undefined,
                error: undefined,
              },
            },
          ]
        : newUploadFiles

    addSkyfiles(newSkyfiles)

    const onUploadStateChange = (
      id: string,
      state: Partial<Skyfile['upload']>
    ) => {
      updateSkyfileUpload(id, {
        ...state,
        updatedAt: new Date().toISOString(),
      })
    }

    newSkyfiles.forEach((skyfile: Skyfile) => {
      const onUploadProgress = (progress) => {
        const status = progress === 1 ? 'processing' : 'uploading'

        const cache = UPLOAD_STATE_CACHE[skyfile.id] || {}

        if (status === cache.status && progress === cache.progress) {
          return
        }

        const state = {
          status,
          progress,
        }

        onUploadStateChange(skyfile.id, state)
        UPLOAD_STATE_CACHE[skyfile.id] = state
      }

      // Reject files larger than our hard limit of 1 TB with proper message
      if (getSize(skyfile) > bytes('1 TB')) {
        onUploadStateChange(skyfile.id, {
          status: 'error',
          error: 'This upload size exceeds the maximum allowed size of 1 TB.',
        })

        return
      }

      const startUpload = async (): Promise<any> => {
        try {
          let response

          // Set the portal before upload initiates
          onUploadStateChange(skyfile.id, {
            ingressPortals: [portal],
          })

          if (skyfile.isDirectory) {
            const fileHandleMap = values(skyfile.metadata.subfiles).reduce(
              (acc, subfile) => ({
                ...acc,
                [getRelativeFilePath(subfile.path)]: subfile.fileHandle,
              }),
              {} as {
                [path: string]: File
              }
            )

            response = await Api.uploadDirectory(
              fileHandleMap,
              encodeURIComponent(skyfile.metadata.filename),
              { onUploadProgress }
            )
          } else {
            response = await Api.uploadFile(skyfile.fileHandle, {
              onUploadProgress,
            })
          }

          updateSkyfile(skyfile.id, {
            skylink: response.skylink,
          })
          onUploadStateChange(skyfile.id, {
            status: 'complete',
            uploadedAt: new Date().toISOString(),
          })
        } catch (error) {
          if (
            error.response &&
            error.response.status === StatusCodes.TOO_MANY_REQUESTS
          ) {
            const cache = UPLOAD_STATE_CACHE[skyfile.id] || {}

            if (cache.progress !== -1) {
              onUploadStateChange(skyfile.id, { progress: -1 })
              UPLOAD_STATE_CACHE[skyfile.id] = {
                ...cache,
                progress: -1,
              }
            }

            return new Promise((resolve) =>
              setTimeout(() => resolve(startUpload()), 3000)
            )
          }

          onUploadStateChange(skyfile.id, {
            status: 'error',
            error: createUploadErrorMessage(error),
          })
        }
      }

      const task = () => startUpload()
      taskQueue.add(task, {
        meta: {
          name: skyfile.metadata.filename,
          operation: 'upload',
        },
      })
    })
  }

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: handleDrop,
  })

  useEffect(() => {
    if (directoryMode) {
      inputRef.current.setAttribute('webkitdirectory', 'true')
    } else {
      inputRef.current.removeAttribute('webkitdirectory')
    }
  }, [directoryMode, inputRef])

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
        border: '1px dashed $gray6',
        borderRadius: '$3',
        overflow: 'hidden',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '$gray2',
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
                backgroundColor: '$blue2',
                border: '1px solid $blue6',
              }
            : {}),
        }}
        {...getRootProps()}
      >
        <Heading size="1">
          Upload {directoryMode ? 'a directory' : 'files'}
        </Heading>
        <Container size="1">
          <Text
            size="3"
            css={{
              color: '$gray11',
              margin: '$1 0 $3',
              lineHeight: '22px',
            }}
          >
            Drop {directoryMode ? 'a directory' : 'files'} here or click to
            browse. Files will be uploaded to <Code>{portal}</Code>. Files will
            be pinned according to the portal's policies on retention.
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
                <Radio
                  value="files"
                  css={{ border: 'none', backgroundColor: 'transparent' }}
                />
              </Flex>
              <Flex css={{ gap: '$1' }} onClick={() => setDirectoryMode(true)}>
                <Text>directory</Text>
                <Radio
                  value="directory"
                  css={{ border: 'none', backgroundColor: 'transparent' }}
                />
              </Flex>
            </Flex>
          </RadioGroup>
        </Flex>
      </Flex>
      <TextField {...getInputProps()} />
    </Box>
  )
}
