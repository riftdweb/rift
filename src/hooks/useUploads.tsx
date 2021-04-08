import { useCallback, createContext, useContext } from 'react'
import { mergeItem } from '../shared/collection'
import { Upload } from '../shared/types'
import { useLocalRootSeed } from './useLocalRootSeed'
import { useSkyState } from './useSkyState'

type State = {
  uploads: Upload[]
  addUploads: (uploads: Upload[]) => void
  updateUpload: (state: Partial<Upload>) => void
}

const UploadsContext = createContext({} as State)
export const useUploads = () => useContext(UploadsContext)

type Props = {
  children: React.ReactNode
}

export function UploadsProvider({ children }: Props) {
  const { localRootSeed } = useLocalRootSeed()

  const {
    state: uploads,
    setState: setUploads,
    refetch: refetchUploads,
  } = useSkyState<Upload[]>(localRootSeed, 'uploads', [])

  const addUploads = useCallback(
    (items) => {
      setUploads((previous) => [...items, ...previous])
    },
    [setUploads]
  )

  const updateUpload = useCallback(
    (state: Upload) => {
      if (!state.id) {
        return
      }
      setUploads((prevUploads: Upload[]) => mergeItem(prevUploads, state))
    },
    [setUploads]
  )

  const value = {
    uploads,
    addUploads,
    updateUpload,
    refetchUploads,
  }

  return (
    <UploadsContext.Provider value={value}>{children}</UploadsContext.Provider>
  )
}
