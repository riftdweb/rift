import { useCallback, useState } from 'react'

export type SortDir = 'asc' | 'desc'

export function useSort<SortKey extends string>(defaultSortKey: SortKey) {
  const [sortKey, setSortKey] = useState<SortKey>(defaultSortKey)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const toggleSortDir = useCallback(() => {
    setSortDir((sortDir) => (sortDir === 'asc' ? 'desc' : 'asc'))
  }, [setSortDir])

  const toggleSort = useCallback(
    (nextSortKey: SortKey) => {
      if (sortKey === nextSortKey) {
        // If already default, keep toggling dir
        if (sortKey === defaultSortKey) {
          toggleSortDir()
        }
        // asc, desc, or reset
        if (sortDir === 'asc') {
          setSortDir('desc')
        } else {
          setSortDir('asc')
          setSortKey(defaultSortKey)
        }
      } else {
        setSortKey(nextSortKey)
        setSortDir('asc')
      }
    },
    [sortKey, sortDir, setSortDir, setSortKey, toggleSortDir, defaultSortKey]
  )

  return {
    sortKey,
    sortDir,
    toggleSort,
  }
}
