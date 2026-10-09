import { createContext, useContext } from 'react'

const ThemePreferenceContext = createContext('light')

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  return <ThemePreferenceContext value="light">{children}</ThemePreferenceContext>
}

export function useThemePreference() {
  return useContext(ThemePreferenceContext)
}
