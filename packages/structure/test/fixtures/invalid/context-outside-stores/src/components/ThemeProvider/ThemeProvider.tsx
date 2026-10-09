import { createContext, useContext } from 'react'

const ThemeContext = createContext('light')

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext value="light">{children}</ThemeContext>
}

export function useTheme() {
  return useContext(ThemeContext)
}
