import { createContext, useContext } from 'react'
import { darkTheme } from '@riftdweb/design-system'
import { useCallback, useEffect } from 'react'
import useLocalStorageState from 'use-local-storage-state'

type State = {
  toggleTheme: () => void
}

const ThemeContext = createContext({} as State)
export const useTheme = () => useContext(ThemeContext)

type Props = {
  children: React.ReactNode
}

export function ThemeProvider({ children }: Props) {
  const [themeConfig, setThemeConfig] = useLocalStorageState('v0/themeConfig', {
    theme: 'dark-theme',
  })

  useEffect(() => {
    document.body.className = ''
    document.body.classList.add(
      themeConfig.theme === 'theme-default' ? 'theme-default' : darkTheme
    )
  }, [themeConfig])

  const toggleTheme = useCallback(() => {
    setThemeConfig({
      theme:
        themeConfig.theme === 'theme-default' ? 'dark-theme' : 'theme-default',
    })
  }, [themeConfig, setThemeConfig])

  const value = {
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
