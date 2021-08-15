import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

type State = {
  ref: React.MutableRefObject<any>
  searchValue: string
  setSearchValue: React.Dispatch<React.SetStateAction<string>>
  isFocused: boolean
  setIsFocused: React.Dispatch<React.SetStateAction<boolean>>
  onChange: (e: any) => void
  width: string
}

const SearchContext = createContext({} as State)
export const useSearch = () => useContext(SearchContext)

type Props = {
  children: React.ReactNode
}

export function SearchProvider({ children }: Props) {
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const ref = useRef()

  const onChange = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setSearchValue(e.target.value)
    },
    [setSearchValue]
  )

  useEffect(() => {
    if (searchValue) {
      if (!isFocused) {
        setIsFocused(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  const width = isFocused || searchValue ? '500px' : '210px'

  const value = {
    ref,
    searchValue,
    setSearchValue,
    isFocused,
    setIsFocused,
    onChange,
    width,
  }

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  )
}
