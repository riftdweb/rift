import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Skyfile } from '@riftdweb/types'
import { parseISO, sub } from 'date-fns'
import { mergeItem } from '../shared/collection'
import { useSkyfilesState } from '../hooks/useSkyfilesState'
import { useAccount } from '../hooks/useAccount'

type State = {
  skyfiles: Skyfile[]
  addSkyfiles: (uploads: Skyfile[]) => void
  updateSkyfile: (id: string, state: Partial<Skyfile>) => void
  removeSkyfile: (id: string) => void
  updateSkyfileUpload: (id: string, state: Partial<Skyfile['upload']>) => void
}

const SkyfilesContext = createContext({} as State)
export const useSkyfiles = () => useContext(SkyfilesContext)

type Props = {
  children: React.ReactNode
}

export function SkyfilesProvider({ children }: Props) {
  const { skyfiles, setSkyfiles, refetchSkyfiles } = useSkyfilesState()
  const [hasCleanedData, setHasCleanedData] = useState<boolean>(false)
  const { isReady } = useAccount()

  // When identity changes reset data cleaning flag
  useEffect(() => {
    if (isReady) {
      setHasCleanedData(false)
    }
  }, [isReady])

  // On identity init, clean up stalled out uploads.
  // DANGER: this function deletes user data.
  useEffect(() => {
    const stallBefore = sub(new Date(), { minutes: 1 })
    if (!hasCleanedData && skyfiles.length) {
      setSkyfiles(
        skyfiles.filter(
          (skyfile) =>
            // Keep uploads that are newer than the stallBefore date
            (skyfile.upload.updatedAt &&
              parseISO(skyfile.upload.updatedAt) > stallBefore) ||
            // Or ones that have successfully completed
            skyfile.upload.status === 'complete'
        )
      )
      setHasCleanedData(true)
    }
  }, [skyfiles, setSkyfiles, hasCleanedData])

  const addSkyfiles = useCallback(
    (items) => {
      setSkyfiles((previous) => [...items, ...previous])
    },
    [setSkyfiles]
  )

  const updateSkyfile = useCallback(
    (id: string, state: Skyfile) => {
      setSkyfiles((prevSkyfiles: Skyfile[]) => {
        const skyfile = prevSkyfiles.find((skyfile) => skyfile.id === id)
        if (!skyfile) {
          return prevSkyfiles
        }
        const updatedSkyfile = {
          ...skyfile,
          ...state,
        }
        return mergeItem(prevSkyfiles, updatedSkyfile)
      })
    },
    [setSkyfiles]
  )

  const removeSkyfile = useCallback(
    (id: string) => {
      setSkyfiles((prevSkyfiles: Skyfile[]) => {
        return prevSkyfiles.filter((skyfile) => skyfile.id !== id)
      })
    },
    [setSkyfiles]
  )

  const updateSkyfileUpload = useCallback(
    (id: string, state: Partial<Skyfile['upload']>) => {
      setSkyfiles((prevSkyfiles: Skyfile[]) => {
        const skyfile = prevSkyfiles.find((skyfile) => skyfile.id === id)
        if (!skyfile) {
          return prevSkyfiles
        }
        const updatedSkyfile = {
          ...skyfile,
          upload: {
            ...skyfile.upload,
            ...state,
          },
        }
        return mergeItem(prevSkyfiles, updatedSkyfile)
      })
    },
    [setSkyfiles]
  )

  const value = {
    skyfiles,
    addSkyfiles,
    removeSkyfile,
    updateSkyfile,
    updateSkyfileUpload,
    refetchSkyfiles,
  }

  return (
    <SkyfilesContext.Provider value={value}>
      {children}
    </SkyfilesContext.Provider>
  )
}
