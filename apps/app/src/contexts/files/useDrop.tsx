import { useEffect } from 'react'
import { Skyfile } from '@riftdweb/types'
import { createLogger } from '@riftdweb/logger'
import { TaskQueue } from '@riftdweb/queue'
import { fileSystemDAC, useSkynet } from '../skynet'
import bytes from 'bytes'
import { StatusCodes } from 'http-status-codes'
import values from 'lodash/values'
import { getSize } from '../../shared/uploads'
import { createUploadErrorMessage, getRelativeFilePath } from './utils'
import { usePortal } from '../../hooks/usePortal'
import { useFs } from '.'
import { useDropzone } from 'react-dropzone'
import { formatFiles } from './formatFiles'

const log = createLogger('files/context/useDrop')

// Serial for now, until the FS DAC handles concurrency
const taskQueue = TaskQueue('files', {
  poolSize: 1,
})

const UPLOAD_STATE_CACHE = {}

function useOnDrop({ directoryMode, directoryPath }) {
  const { Api, getKey } = useSkynet()
  const { portal } = usePortal()

  const {
    addFiles,
    updateFileUploadStatus,
    updateFile,
    directoryIndex,
  } = useFs()

  return async (droppedFiles, _, e) => {
    const newSkyfiles = formatFiles(droppedFiles, directoryMode)

    addFiles(newSkyfiles)

    const onUploadStateChange = (
      id: string,
      state: Partial<Skyfile['upload']>
    ) => {
      updateFileUploadStatus(id, {
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

      // Reject files larger than our hard limit of 1 GB with proper message
      if (getSize(skyfile) > bytes('1 GB')) {
        onUploadStateChange(skyfile.id, {
          status: 'error',
          error: 'This upload size exceeds the maximum allowed size of 1 GB.',
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
            // response = await Api.uploadFile(skyfile.fileHandle, {
            //   onUploadProgress,
            // })
            log('Uploading via fs dac')
            const uploadTask = () =>
              fileSystemDAC.uploadFileData(skyfile.fileHandle)

            const fileData = await uploadTask()

            if (
              directoryIndex.data?.entries.find(
                (node) => node.data.name === skyfile.metadata.filename
              )
            ) {
              log('Updating existing file')
              const res = await fileSystemDAC.updateFile(
                directoryPath,
                skyfile.metadata.filename,
                fileData
              )
              log(res)
            } else {
              log('Creating new file')
              const res = await fileSystemDAC.createFile(
                directoryPath,
                skyfile.metadata.filename,
                fileData
              )
              log(res)
            }
            log('Done!')
          }

          updateFile(skyfile.id, {
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
        priority: 1,
        meta: {
          name: skyfile.metadata.filename,
          operation: 'upload',
        },
      })
    })
  }
}

export function useDrop(directoryPath: string) {
  const directoryMode = false
  // const [directoryMode, setDirectoryMode] = useLocalStorageState<boolean>(
  //   'directoryMode',
  //   false
  // )

  const onDrop = useOnDrop({ directoryMode, directoryPath })

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop,
    noDragEventsBubbling: true,
  })

  useEffect(() => {
    if (!inputRef.current) {
      return
    }

    if (directoryMode) {
      inputRef.current.setAttribute('webkitdirectory', 'true')
    } else {
      inputRef.current.removeAttribute('webkitdirectory')
    }
  }, [directoryMode, inputRef])

  // const toggleDirectoryModeRadio = useCallback(
  //   (e) => {
  //     setDirectoryMode(e.target.value === 'directory')
  //   },
  //   [setDirectoryMode]
  // )

  return {
    getRootProps,
    getInputProps,
    isDragActive,
    inputRef,
  }
}
