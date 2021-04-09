import { useCallback, createContext, useContext, useEffect } from 'react'
import { mergeItem } from '../shared/collection'
import { Skyfile } from '../shared/types'
import { useLocalRootSeed } from './useLocalRootSeed'
import { useSkyState } from './useSkyState'
import { sub, parseISO } from 'date-fns'

type State = {
  skyfiles: Skyfile[]
  addSkyfiles: (uploads: Skyfile[]) => void
  updateSkyfile: (id: string, state: Partial<Skyfile>) => void
  updateSkyfileUpload: (id: string, state: Partial<Skyfile['upload']>) => void
}

const SkyfilesContext = createContext({} as State)
export const useSkyfiles = () => useContext(SkyfilesContext)

type Props = {
  children: React.ReactNode
}

let hasCheckedOnce = false

export function SkyfilesProvider({ children }: Props) {
  const { localRootSeed } = useLocalRootSeed()

  const {
    state: skyfiles,
    setState: setSkyfiles,
    refetch: refetchSkyfiles,
  } = useSkyState<Skyfile[]>(localRootSeed, 'skyfiles', [])

  // On app init, clean up stalled out uploads
  useEffect(() => {
    const stallPeriod = sub(new Date(), { minutes: 1 })
    if (!hasCheckedOnce && skyfiles.length) {
      setSkyfiles(
        skyfiles.filter(
          (skyfile) =>
            // Remove uploads that have stalled out for a period of time
            (skyfile.upload.updatedAt &&
              parseISO(skyfile.upload.updatedAt) > stallPeriod) ||
            skyfile.upload.status === 'complete'
        )
      )
      hasCheckedOnce = true
    }
  }, [skyfiles, setSkyfiles])

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
