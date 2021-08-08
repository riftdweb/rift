import { Feed } from '@riftdweb/types'
import { useParams } from 'react-router-dom'
import {
  DirectoryFile,
  DirectoryIndex,
} from 'fs-dac-library/dist/cjs/skystandards'
import { IFileSystemDACResponse } from 'fs-dac-library/dist/cjs/types'
import {
  createContext,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from 'react'
import useSWR, { SWRResponse } from 'swr'
import { getDataKeyFs } from '../shared/dataKeys'
import { fileSystemDAC, useSkynet } from './skynet'

const dataKeyFs = getDataKeyFs()

type Directory = DirectoryIndex['directories']['']

export type Node = {
  type: 'directory' | 'file'
  data: Directory | DirectoryFile
  pending?: boolean
}

type State = {
  directoryIndex: SWRResponse<Feed<Node>, any>
  createDirectory: (name: string) => void
  setActiveDirectory: React.Dispatch<SetStateAction<string[]>>
  activeDirectory: string[]
}

const FsContext = createContext({} as State)
export const useFs = () => useContext(FsContext)

type Props = {
  children: React.ReactNode
}

export function FsProvider({ children }: Props) {
  const { getKey, appDomain } = useSkynet()
  const router = useParams()
  console.log(router)

  const [activeDirectory, setActiveDirectory] = useState<string[]>([appDomain])

  const directoryIndex = useSWR(
    getKey([appDomain, ...activeDirectory]),
    async (): Promise<Feed<Node>> => {
      const directoryIndex = await fileSystemDAC.getDirectoryIndex(
        activeDirectory.join('/')
      )
      const directories = Object.entries(directoryIndex.directories).map(
        ([_, directory]) =>
          ({
            data: directory,
            type: 'directory',
          } as Node)
      )
      const files = Object.entries(directoryIndex.files).map(
        ([_, file]) =>
          ({
            data: file,
            type: 'file',
          } as Node)
      )
      return {
        entries: [...directories, ...files],
        updatedAt: new Date().getTime(),
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

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

  const value = {
    directoryIndex,
    createDirectory,
    setActiveDirectory,
    activeDirectory,
  }

  return <FsContext.Provider value={value}>{children}</FsContext.Provider>
}
