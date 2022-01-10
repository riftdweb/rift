import { createLogger } from '@riftdweb/logger'
import { TaskQueue } from '@riftdweb/queue'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuid } from 'uuid'
import { fileSystemDAC, FsFile } from '../..'
import { formatUploads } from './formatUploads'
import { getDirectoryIndex } from '../../contexts/files/fs'
import { createUploadErrorMessage } from './utils'
import { ControlRef } from '../../ref'

const logName = 'services/files/upload'

const uploadTaskQueue = TaskQueue('uploadsFile', {
  poolSize: 5,
})

type Params = {}

export async function handleUploads(
  ref: ControlRef,
  directoryPath: string,
  droppedFiles: any[],
  _params: Params = {}
): Promise<void> {
  const workflowId = uuid()
  const log = createLogger(logName, {
    workflowId,
  })

  const directoryUploads = ref.current.files.getUploads(directoryPath)
  const existingFiles = (await getDirectoryIndex(directoryPath)).filter(
    (node) => node.type === 'file'
  ) as FsFile[]

  let fileUploads = formatUploads(directoryPath, droppedFiles, existingFiles)

  fileUploads = fileUploads.filter(
    (fileUpload) =>
      // TODO: instead make it cancel the in progress upload
      !directoryUploads.find(
        (upload) => upload.data.name === fileUpload.data.name
      )
  )

  ref.current.files.upsertUploads(directoryPath, fileUploads)

  fileUploads.forEach((fileUpload: FsFile) => {
    const fileLog = log.createLogger(fileUpload.data.name)
    const startUpload = async (): Promise<any> => {
      try {
        log('Uploading via fs dac')
        const uploadTask = () =>
          fileSystemDAC.uploadFileData(
            fileUpload.upload.file.fileHandle,
            fileUpload.data.name,
            (progress) => {
              ref.current.files.setUploadProgress(
                directoryPath,
                fileUpload.id,
                progress
              )
            }
          )

        const fileData = await uploadTask()

        const existingFile = ref.current.files.activeDirectoryIndex.data?.entries.find(
          (node) => node.id === fileUpload.id
        )

        if (existingFile) {
          fileLog('Updating existing file')
          const res = await fileSystemDAC.updateFile(
            directoryPath,
            fileUpload.data.name,
            fileData
          )
          fileLog(res)
        } else {
          fileLog('Creating new file')
          const res = await fileSystemDAC.createFile(
            directoryPath,
            fileUpload.data.name,
            fileData
          )
          fileLog(res)
        }
        fileLog('Done!')

        ref.current.files.setUploadComplete(directoryPath, fileUpload.id)
      } catch (error) {
        if (
          error.response &&
          error.response.status === StatusCodes.TOO_MANY_REQUESTS
        ) {
          return new Promise((resolve) =>
            setTimeout(() => resolve(startUpload()), 3000)
          )
        }

        fileLog(error)
        ref.current.files.setUploadError(
          directoryPath,
          fileUpload.id,
          createUploadErrorMessage(error)
        )
      }
    }

    const task = () => startUpload()
    uploadTaskQueue.add(task, {
      priority: 4,
      meta: {
        name: fileUpload.data.name,
        operation: 'upload',
      },
    })
  })
}
