import { Feed, Skyfile } from '@riftdweb/types'
import { useHistory } from 'react-router-dom'
import {
  DirectoryFile,
  DirectoryIndex,
} from 'fs-dac-library/dist/cjs/skystandards'
import { IFileSystemDACResponse } from 'fs-dac-library/dist/cjs/types'
import { createContext, useCallback, useContext, useMemo } from 'react'
import useSWR, { SWRResponse } from 'swr'
import { usePathOutsideRouter } from '../../hooks/usePathOutsideRouter'
import { fileSystemDAC, useSkynet } from '../skynet'
import { createLogger } from '../../shared/logger'
import { useBeforeunload } from 'react-beforeunload'
import { usePortal } from '../../hooks/usePortal'

const log = createLogger('files/context')

type Directory = DirectoryIndex['directories']['']

export type Node = NodeFile | NodeDirectory

export type NodeFile = {
  type: 'file'
  data: DirectoryFile
  pending?: boolean
}

export type NodeDirectory = {
  type: 'directory'
  data: Directory
  pending?: boolean
}

type State = {
  activePath: string[]

  directoryIndex: SWRResponse<Feed<Node>, any>
  createDirectory: (name: string) => void

  activeFile?: NodeFile

  // From uploader
  addFiles: (skyfiles: Skyfile[]) => void
  updateFile: (id: string, state: Partial<Skyfile>) => void
  updateFileUploadStatus: (
    id: string,
    state: Partial<Skyfile['upload']>
  ) => void
  // areUploadsInProgress: boolean
  // toggleDirectoryModeRadio: (e: any) => void
  // directoryMode: boolean
  // setDirectoryMode: (mode: boolean) => void
  // getRootProps: any
  // getInputProps: any
  // isDragActive: boolean
}

const FsContext = createContext({} as State)
export const useFs = () => useContext(FsContext)

type Props = {
  children: React.ReactNode
}

export function FsProvider({ children }: Props) {
  const { Api, getKey, appDomain } = useSkynet()

  const activePath = useParamFilePath()

  const { data: activeDirectory } = useSWR(
    getKey(activePath),
    async (): Promise<string[]> => {
      const lastPart = activePath[activePath.length - 1]

      let activeDirectory = activePath

      // Simple check
      if (lastPart?.includes('.')) {
        log('Found dot in file name')
        activeDirectory = activePath.slice(0, activePath.length - 1)
      } else {
        log('Fetching and checking parent dir')
        const parentDirectoryIndex = await fileSystemDAC.getDirectoryIndex(
          activePath.slice(0, activePath.length - 1).join('/')
        )
        if (parentDirectoryIndex.files[lastPart]) {
          activeDirectory = activePath.slice(0, activePath.length - 1)
        }
      }

      return activeDirectory
    },
    {
      revalidateOnFocus: false,
    }
  )

  const directoryIndex = useSWR(
    activeDirectory ? getKey(activePath) : null,
    async (): Promise<Feed<Node>> => {
      const _directoryIndex = await fileSystemDAC.getDirectoryIndex(
        activeDirectory.join('/')
      )

      const directories = Object.entries(_directoryIndex.directories).map(
        ([_, directory]) =>
          ({
            data: directory,
            type: 'directory',
          } as Node)
      )
      const files = Object.entries(_directoryIndex.files).map(
        ([_, file]) =>
          ({
            data: file,
            type: 'file',
          } as Node)
      )
      log('here', directories, files)
      return {
        entries: [...directories, ...files],
        updatedAt: new Date().getTime(),
      }
    },
    {
      revalidateOnFocus: false,
    }
  )
  log(activeDirectory, directoryIndex.data)

  const activeFile = useMemo(() => {
    if (!directoryIndex.data) {
      return undefined
    }
    const fileName = decodeURI(activePath[activePath.length - 1])
    log('here', directoryIndex.data)
    return directoryIndex.data?.entries.find(
      (entry) => entry.type === 'file' && entry.data.name === fileName
    ) as NodeFile
  }, [activePath, directoryIndex])

  const createDirectory = useCallback(
    (name: string) => {
      const func = async () => {
        directoryIndex.mutate(
          (data) => ({
            updatedAt: new Date().getTime(),
            entries: data.entries.concat([
              {
                pending: true,
                type: 'directory',
                data: {
                  name,
                  created: new Date().getTime(),
                },
              },
            ]),
          }),
          false
        )
        const response: IFileSystemDACResponse = await fileSystemDAC.createDirectory(
          activeDirectory.join('/'),
          name
        )
        directoryIndex.mutate()
      }
      func()
    },
    [appDomain, directoryIndex]
  )

  // From uploader
  const addFiles = useCallback(
    (skyfiles: Skyfile[]) => {
      log('addFiles', skyfiles)
      directoryIndex.mutate(
        (data) => ({
          updatedAt: new Date().getTime(),
          entries: data.entries.concat(
            skyfiles.map((skyfile) => ({
              pending: true,
              type: 'file',
              data: {
                name: skyfile.metadata.filename,
                created: new Date().getTime(),
                modified: new Date().getTime(),
                version: 0,
                file: {
                  url: '',
                  key: '',
                  encryptionType: '',
                  size: 0,
                  chunkSize: 0,
                  hash: '',
                  ts: 0,
                },
              },
            }))
          ),
        }),
        false
      )
    },
    [directoryIndex]
  )
  const updateFile = useCallback((id: string, state: Partial<Skyfile>) => {
    log('updateFile', id, state)
  }, [])
  const updateFileUploadStatus = useCallback(
    (id: string, state: Partial<Skyfile['upload']>) => {
      log('updateFileUploadStatus', id, state)
    },
    []
  )
  const areUploadsInProgress = false

  useBeforeunload((e) => {
    if (areUploadsInProgress) {
      e.preventDefault()
    }
  })

  const value = {
    directoryIndex,
    createDirectory,
    activePath,
    activeFile,
    addFiles,
    updateFileUploadStatus,
    updateFile,
  }

  return <FsContext.Provider value={value}>{children}</FsContext.Provider>
}

function useParamFilePath(): string[] {
  const { appDomain } = useSkynet()
  const history = useHistory()
  const allPath = usePathOutsideRouter()

  if (allPath[0] !== 'files') {
    return []
  }

  const path = allPath.slice(1)

  if (path.length === 0) {
    history.push(`/files/${appDomain}`)
  }

  return path
}
