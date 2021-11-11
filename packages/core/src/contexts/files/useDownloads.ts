import { useCallback, useEffect, useState } from 'react'
import throttle from 'lodash/throttle'
import { FsFile } from './types'
import { downloadFileToBlob, saveBlobToMachine } from './download'

const throttleDownloadProgress = throttle((func: () => void) => {
  func()
}, 500)

export type Download = {
  url?: string
  progress: number
  isDownloading: boolean
  isComplete: boolean
  promise?: Promise<string>
}

const defaultDownload = {
  progress: 0,
  isDownloading: false,
  isComplete: false,
  promise: undefined,
}

export function useDownloads(activeFile?: FsFile) {
  const [downloadMap, _setDownloadMap] = useState<{
    [filePath: string]: Download
  }>({})

  const setDownloadMap = useCallback(
    (path: string, val: Partial<Download>) => {
      _setDownloadMap((map) => {
        const download = map[path] || {
          ...defaultDownload,
          ...val,
        }
        return {
          ...map,
          [path]: {
            ...download,
            ...val,
          },
        }
      })
    },
    [_setDownloadMap]
  )

  const getDownload = useCallback(
    (path: string): Download => downloadMap[path] || defaultDownload,
    [downloadMap]
  )

  const startDownload = useCallback(
    (file: FsFile, saveToMachine?: boolean) => {
      const path = file.path

      const func = async () => {
        let existingDownload = getDownload(path)

        if (existingDownload.isDownloading) {
          if (existingDownload.promise) {
            await existingDownload.promise
          }
          existingDownload = getDownload(path)

          if (saveToMachine) {
            saveBlobToMachine(file.data.name, existingDownload.url!)
          }
          return
        }

        const promise = downloadFileToBlob(file.data, (progress) => {
          throttleDownloadProgress(() =>
            setDownloadMap(path, {
              progress,
            })
          )
        })
        setDownloadMap(path, {
          isDownloading: true,
          promise,
        })

        const url = await promise

        setDownloadMap(path, {
          progress: 1,
          promise: undefined,
          isComplete: true,
          url,
        })

        if (saveToMachine) {
          saveBlobToMachine(file.data.name, url)
        }
      }
      func()
    },
    [setDownloadMap, getDownload]
  )

  // On activeFile change
  useEffect(() => {
    if (!activeFile) {
      return
    }

    // Download in browser if smaller than 50MB
    // const mb = 500
    const mb = 50
    const smallEnough = activeFile.data.file.size < mb * 1024 * 1024
    const shouldDownload = smallEnough

    if (!shouldDownload) {
      return
    }

    startDownload(activeFile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile])

  return {
    getDownload,
    startDownload,
  }
}
