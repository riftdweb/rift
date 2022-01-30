import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Feed, IUser } from '@riftdweb/types'
import { createLogger } from '@riftdweb/logger'
import sortBy from 'lodash/sortBy'
import uniqBy from 'lodash/uniqBy'
import useSWR, { SWRResponse } from 'swr'
import { usePathOutsideRouter } from '../../hooks/usePathOutsideRouter'
import { useBeforeunload } from 'react-beforeunload'
import { SortDir, useSort } from '../../hooks/useSort'
import { EntriesResponse, upsertItem, useUser } from '../..'
import { ThrottleMap } from './throttleMap'
import { FsNode, FsFile } from './types'
import { getDirectoryIndex } from './fs'
import { Download, useDownloads } from './useDownloads'
import { buildFsDirectory, getNodePath } from './utils'
import { useAccount } from '../../hooks/useAccount'

const log = createLogger('files/context')

const throttleUploadProgress = ThrottleMap()

type SortKey =
  | 'id'
  | 'data.name'
  | 'data.size'
  | 'data.type'
  | 'data.modified'
  | 'data.file.encryptionType'

export type CreateDirectoryParams = {
  name: string
}

export type FilesState = {
  activeNode: string[]
  activeNodePath: string

  activeNodeOwner: IUser
  activeNodeOwnerId?: string
  isActiveNodeShared: boolean
  isActiveNodeReadOnly: boolean
  isActiveNodeReadWrite: boolean

  activeDirectory: SWRResponse<string[], any>
  activeDirectoryPath: string

  activeDirectoryIndex: SWRResponse<Feed<FsNode>, any>
  sortedIndex: EntriesResponse<FsNode>
  sortKey: SortKey
  sortDir: SortDir
  toggleSort: (sortKey: SortKey) => void

  createDirectory: (params: CreateDirectoryParams) => Promise<boolean>
  activeFile?: FsFile

  // From uploader
  uploadsMap: Record<string, FsFile[]>
  upsertUploads: (directoryPath: string, files: FsFile[]) => void
  getUploads: (directoryPath: string) => FsFile[]
  setUploadProgress: (
    directoryPath: string,
    id: string,
    progress: number
  ) => void
  setUploadComplete: (directoryPath: string, id: string) => void
  setUploadError: (directoryPath: string, id: string, error: string) => void

  // Download
  getDownload: (path: string) => Download
  startDownload: (file: FsFile, saveToMachine?: boolean) => void
}

const FsContext = createContext({} as FilesState)
export const useFs = () => useContext(FsContext)

type Props = {
  children: React.ReactNode
}

export function FsProvider({ children }: Props) {
  const { id, myUserId, isReady } = useAccount()

  const activeNode = useParamNode()

  const activeNodePath = getNodePath(activeNode)
  const { sortKey, sortDir, toggleSort } = useSort<SortKey>('id')

  const [uploadsMap, _setUploadsMap] = useState<Record<string, FsFile[]>>({})

  const getUploads = useCallback(
    (directoryPath: string) => uploadsMap[directoryPath] || [],
    [uploadsMap]
  )

  const setUploads = useCallback(
    (directoryPath: string, newUploads: FsFile[]) => {
      _setUploadsMap((map) => {
        return {
          ...map,
          [directoryPath]: newUploads,
        }
      })
    },
    [_setUploadsMap]
  )

  const upsertUploads = useCallback(
    (directoryPath: string, newUploads: FsFile[]) => {
      _setUploadsMap((map) => {
        const existingUploads = getUploads(directoryPath)
        const uploads = newUploads.reduce(
          (acc, upload) => upsertItem(acc, upload),
          existingUploads
        )
        return {
          ...map,
          [directoryPath]: uploads,
        }
      })
    },
    [_setUploadsMap, getUploads]
  )

  const activeDirectory = useSWR(
    isReady ? [id, ...activeNode, 'directory'] : null,
    async (): Promise<string[]> => {
      const lastPart = activeNode[activeNode.length - 1]

      let _activeDirectory = activeNode

      // If the activePath is not greater than 1 then the root directory is open
      if (activeNode.length > 1) {
        // If the activePath includes a . in the last part then a file is definitely open
        if (lastPart?.includes('.')) {
          _activeDirectory = activeNode.slice(0, activeNode.length - 1)
        } else {
          // Otherwise fetch and explicitly check if the second to last part is a directory with the file
          const parentDirectoryIndex = await fileSystemDAC.getDirectoryIndex(
            getNodePath(activeNode.slice(0, activeNode.length - 1))
          )
          if (parentDirectoryIndex.files[lastPart]) {
            _activeDirectory = activeNode.slice(0, activeNode.length - 1)
          }
        }
      }

      return _activeDirectory
    },
    {
      revalidateOnFocus: false,
    }
  )

  const activeDirectoryPath = activeDirectory.data?.join('/') || ''

  const activeDirectoryIndex = useSWR(
    isReady && activeDirectory.data ? [id, ...activeNode, 'index'] : null,
    async (): Promise<Feed<FsNode>> => {
      const nodes = await getDirectoryIndex(getNodePath(activeDirectory.data))

      return {
        entries: nodes,
        updatedAt: new Date().getTime(),
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    const files = activeDirectoryIndex.data?.entries

    if (!files || !files.length) {
      return
    }

    const uploads = getUploads(activeDirectoryPath)

    setUploads(
      activeDirectoryPath,
      uploads.filter(
        (upload) =>
          !files.find(
            (file) =>
              file.id === upload.id && file.data.version >= upload.data.version
          )
      )
    )
    // data changes after a mutate resyncs the index
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDirectoryIndex.data])

  const setUploadPending = useCallback(
    (directoryPath: string, id: string) => {
      const fileUploads = getUploads(directoryPath)
      const fileUpload = fileUploads.find((u) => u.id === id)

      if (!fileUpload) {
        return
      }

      const nextState: FsFile = {
        ...fileUpload,
        status: 'pending',
        upload: undefined,
      }

      const newFileUploads = upsertItem(fileUploads, nextState)
      upsertUploads(directoryPath, newFileUploads)
    },
    [getUploads, upsertUploads]
  )

  const setUploadProgress = useCallback(
    (directoryPath: string, id: string, progress: number) => {
      log(directoryPath, id, progress)
      if (progress === 1) {
        setUploadPending(directoryPath, id)
      }
      throttleUploadProgress(directoryPath + id, () => {
        const fileUploads = getUploads(directoryPath)
        const fileUpload = fileUploads.find((u) => u.id === id)

        if (!fileUpload) {
          return
        }

        const nextState: FsFile = {
          ...fileUpload,
          upload: {
            ...fileUpload.upload,
            progress,
          },
        }

        const newFileUploads = upsertItem(fileUploads, nextState)
        upsertUploads(directoryPath, newFileUploads)
      })
    },
    [getUploads, upsertUploads, setUploadPending]
  )

  const setUploadComplete = useCallback(
    (directoryPath: string, id: string) => {
      const fileUploads = getUploads(directoryPath)
      const fileUpload = fileUploads.find((u) => u.id === id)

      if (!fileUpload) {
        return
      }

      const newFileUploads = upsertItem(fileUploads, {
        ...fileUpload,
        status: 'complete',
        upload: undefined,
      })
      upsertUploads(directoryPath, newFileUploads)

      if (activeDirectoryPath === directoryPath) {
        activeDirectoryIndex.mutate()
      }
    },
    [activeDirectoryIndex, activeDirectoryPath, getUploads, upsertUploads]
  )

  const setUploadError = useCallback(
    (directoryPath: string, id: string, error: string) => {
      const fileUploads = getUploads(directoryPath)
      const fileUpload = fileUploads.find((u) => u.id === id)
      const newFileUploads = upsertItem(fileUploads, {
        ...fileUpload,
        status: 'error',
        upload: {
          ...fileUpload.upload,
          error,
        },
      })
      upsertUploads(directoryPath, newFileUploads)
      if (activeDirectoryPath === directoryPath) {
        activeDirectoryIndex.mutate()
      }
    },
    [activeDirectoryIndex, activeDirectoryPath, getUploads, upsertUploads]
  )

  const activeDirectoryPendingUploads = useMemo(() => {
    const directoryPath = activeDirectory.data?.join('/')
    if (directoryPath) {
      return getUploads(directoryPath)
    } else {
      return []
    }
  }, [activeDirectory, getUploads])

  const activeFile = useMemo(() => {
    if (!activeDirectoryIndex.data) {
      return undefined
    }
    const fileName = decodeURI(activeNode[activeNode.length - 1])
    return activeDirectoryIndex.data?.entries.find(
      (entry) => entry.type === 'file' && entry.data.name === fileName
    ) as FsFile
  }, [activeNode, activeDirectoryIndex])

  const createDirectory = useCallback(
    ({ name }: { name: string }): Promise<boolean> => {
      const func = async () => {
        activeDirectoryIndex.mutate(
          (data) => ({
            updatedAt: new Date().getTime(),
            entries: data.entries.concat([
              buildFsDirectory(activeDirectoryPath, name, {
                status: 'pending',
                data: {
                  name,
                  created: new Date().getTime(),
                },
              }),
            ]),
          }),
          false
        )

        const _func = async () => {
          await fileSystemDAC.createDirectory(activeDirectoryPath, name)

          activeDirectoryIndex.mutate()
        }

        _func()
        return true
      }

      return func()
    },
    [activeDirectoryIndex, activeDirectoryPath]
  )

  const areUploadsInProgress = useMemo(
    () =>
      !!activeDirectoryIndex.data?.entries.find((entry) =>
        ['pending', 'uploading'].includes(entry.status)
      ),
    [activeDirectoryIndex]
  )

  useBeforeunload((e) => {
    if (areUploadsInProgress) {
      e.preventDefault()
    }
  })

  const sortedIndex = useMemo(() => {
    if (!activeDirectoryIndex.data) {
      if (!activeDirectoryIndex.error) {
        return {
          data: null,
          isValidating: true,
        }
      } else {
        return {
          data: null,
          error: activeDirectoryIndex.error,
          isValidating: activeDirectoryIndex.isValidating,
        }
      }
    }

    const entries = sortBy(
      uniqBy(
        [
          ...activeDirectoryPendingUploads,
          ...(activeDirectoryIndex.data.entries || []),
        ],
        'data.name'
      ),
      [sortKey]
    )
    if (sortDir === 'desc') {
      entries.reverse()
    }
    return {
      data: {
        entries,
        updatedAt: 0,
      },
      isValidating: activeDirectoryIndex.isValidating,
    }
  }, [activeDirectoryIndex, sortDir, sortKey, activeDirectoryPendingUploads])

  const { getDownload, startDownload } = useDownloads(activeFile)

  const isActiveNodeShared = !!activeNode[0]?.split('==@')[1]

  const activeNodeSharedOwnerId = activeNode[0]?.split('==@')[1]
  const activeNodeOwnerId =
    activeNodeSharedOwnerId && activeNodeSharedOwnerId !== 'shared'
      ? activeNodeSharedOwnerId
      : myUserId

  const isActiveNodeReadOnly =
    isActiveNodeShared && !!activeNode[0]?.includes('r:')
  const isActiveNodeReadWrite =
    !isActiveNodeShared || !!activeNode[0]?.includes('rw:')
  const activeNodeOwner = useUser(activeNodeOwnerId)

  const value = useMemo(
    () => ({
      activeDirectoryIndex,
      sortedIndex,
      createDirectory,
      activeNode,
      activeNodePath,
      activeNodeOwner,
      activeNodeOwnerId,
      isActiveNodeShared,
      isActiveNodeReadOnly,
      isActiveNodeReadWrite,
      activeDirectory,
      activeDirectoryPath,
      activeFile,
      sortKey,
      sortDir,
      toggleSort,
      uploadsMap,
      getUploads,
      upsertUploads,
      setUploadProgress,
      setUploadComplete,
      setUploadError,
      getDownload,
      startDownload,
    }),
    [
      activeDirectoryIndex,
      sortedIndex,
      createDirectory,
      activeNode,
      activeNodePath,
      activeNodeOwner,
      activeNodeOwnerId,
      isActiveNodeShared,
      isActiveNodeReadOnly,
      isActiveNodeReadWrite,
      activeDirectory,
      activeDirectoryPath,
      activeFile,
      sortKey,
      sortDir,
      toggleSort,
      uploadsMap,
      getUploads,
      upsertUploads,
      setUploadProgress,
      setUploadComplete,
      setUploadError,
      getDownload,
      startDownload,
    ]
  )

  useEffect(() => {
    ref.current.files = value
  }, [ref, value])

  return <FsContext.Provider value={value}>{children}</FsContext.Provider>
}

function useParamNode(): string[] {
  const allPath = usePathOutsideRouter()

  if (allPath[0] !== 'files') {
    return []
  }

  const path = allPath.slice(1)

  return path
}

export { useDrop } from './useDrop'
export * from './types'
export * from './download'
export * from './useDownloads'
