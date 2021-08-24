import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import debounce from 'lodash/debounce'
import { useUsers } from './users'
import { IUser } from '@riftdweb/types'

type State = {
  ref: React.MutableRefObject<any>
  searchValue: string
  setSearchValue: React.Dispatch<React.SetStateAction<string>>
  isFocused: boolean
  isOpen: boolean
  setIsFocused: React.Dispatch<React.SetStateAction<boolean>>
  onChange: (e: any) => void
  userSearchResultsCount: number
  userSearchResultsPage: IUser[]
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

  const isOpen = isFocused || !!searchValue

  const { indexedUsersIndex } = useUsers()
  const [userSearchResults, setUserSearchResults] = useState<IUser[]>(
    indexedUsersIndex
  )

  useEffect(() => {
    filterItems(indexedUsersIndex, searchValue, setUserSearchResults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  const userSearchResultsPage = useMemo(() => userSearchResults.slice(0, 30), [
    userSearchResults,
  ])

  const value = {
    ref,
    isOpen,
    searchValue,
    setSearchValue,
    isFocused,
    setIsFocused,
    onChange,
    userSearchResultsPage,
    userSearchResultsCount: userSearchResults.length,
  }

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  )
}

const filterItems = debounce(
  (
    items: IUser[],
    searchValue: string,
    callback: (results: IUser[]) => void
  ): void => {
    const lowerCaseSearchValue = searchValue.toLowerCase()

    const results = items.filter((user) => {
      if (user.userId.includes(searchValue)) {
        return true
      }
      if (user.username?.toLowerCase().includes(lowerCaseSearchValue)) {
        return true
      }
      if (
        user.profile.data?.firstName
          ?.toLowerCase()
          .includes(lowerCaseSearchValue)
      ) {
        return true
      }
      if (
        user.profile.data?.lastName
          ?.toLowerCase()
          .includes(lowerCaseSearchValue)
      ) {
        return true
      }
      if (
        user.profile.data?.aboutMe?.toLowerCase().includes(lowerCaseSearchValue)
      ) {
        return true
      }
      if (
        user.profile.data?.location
          ?.toLowerCase()
          .includes(lowerCaseSearchValue)
      ) {
        return true
      }
      return false
    })

    callback(results)
  },
  500
)
