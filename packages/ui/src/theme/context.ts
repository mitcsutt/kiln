import { createContext, useContext } from 'react'
import type { ColorMode, ThemeName } from './themes'

export interface ThemeContextValue {
  theme: ThemeName
  mode: ColorMode
  /** The mode actually rendered once `system` is resolved (`light` during SSR). */
  resolvedMode: 'light' | 'dark'
  setTheme: (theme: ThemeName) => void
  setMode: (mode: ColorMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

/** Read and change the current theme/mode. Must be inside `<ThemeProvider>`. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme() must be used inside <ThemeProvider>.')
  return ctx
}
