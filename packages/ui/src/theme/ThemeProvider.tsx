import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { DEFAULT_THEME } from './themes'
import type { ColorMode, ThemeName } from './themes'
import type { ThemeContextValue } from './context'

import { ThemeContext, DEFAULT_STORAGE_KEY } from './context'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function readStoredMode(storageKey: string): ColorMode | undefined {
  try {
    const v = typeof localStorage === 'undefined' ? null : localStorage.getItem(storageKey)
    return v === 'light' || v === 'dark' || v === 'system' ? v : undefined
  } catch {
    return undefined
  }
}

function subscribeToStorage(onChange: () => void): () => void {
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener('storage', onChange)
  }
}

/**
 * The mode stored by an earlier visit, read only on the client (`undefined` while
 * rendering on the server and during hydration, so markup always matches).
 */
function useStoredMode(enabled: boolean, storageKey: string): ColorMode | undefined {
  return useSyncExternalStore(
    subscribeToStorage,
    () => (enabled ? readStoredMode(storageKey) : undefined),
    () => undefined,
  )
}

function subscribeToSystemDark(onChange: () => void): () => void {
  if (typeof matchMedia === 'undefined') return () => undefined
  const mq = matchMedia(DARK_QUERY)
  mq.addEventListener('change', onChange)
  return () => {
    mq.removeEventListener('change', onChange)
  }
}

function useSystemDark(): boolean {
  return useSyncExternalStore(
    subscribeToSystemDark,
    () => typeof matchMedia !== 'undefined' && matchMedia(DARK_QUERY).matches,
    () => false,
  )
}

export interface ThemeProviderProps {
  /**
   * Which theme to render (default `paper`). A built-in name, or any name your own
   * `[data-theme='<name>']` stylesheet defines. Controlled if `onThemeChange` is also supplied.
   */
  theme?: ThemeName
  /** Initial/controlled colour mode. `system` follows the OS via CSS alone — no flash. */
  mode?: ColorMode
  /**
   * Uncontrolled starting mode when the user hasn't chosen one yet (default `system`).
   * A stored choice (see `persistMode`) always wins. Monograph is dark-first, so apps
   * using it usually pass `defaultMode="dark"`. Pair with `themeScript(theme, defaultMode)`.
   */
  defaultMode?: ColorMode
  onThemeChange?: (theme: ThemeName) => void
  onModeChange?: (mode: ColorMode) => void
  /** Persist the user's mode choice in localStorage. Default `true`. */
  persistMode?: boolean
  /**
   * The localStorage key the mode is stored under (default `kiln-color-mode`). Give each
   * app on one origin its own key, or keep an existing one so readers' choices carry over.
   * Pass the same key to `themeScript`.
   */
  storageKey?: string
  /**
   * Where to write `data-theme` / `data-mode`. `document` (default) targets `<html>`,
   * which is what an app wants. Use `<ThemeScope>` for nested, local themes.
   */
  target?: 'document' | 'none'
  children: ReactNode
}

/**
 * App-level theme state. Writes `data-theme` + `data-mode` to `<html>` and exposes
 * `useTheme()`. All visual work happens in CSS; this component only flips attributes.
 *
 * For SSR without a flash, also render `<script dangerouslySetInnerHTML={{ __html: themeScript() }} />`
 * in the document head (see `themeScript`).
 */
export function ThemeProvider({
  theme: themeProp = DEFAULT_THEME,
  mode: modeProp,
  defaultMode = 'system',
  onThemeChange,
  onModeChange,
  persistMode = true,
  storageKey = DEFAULT_STORAGE_KEY,
  target = 'document',
  children,
}: ThemeProviderProps) {
  const [themeState, setThemeState] = useState<ThemeName>(themeProp)
  const [prevThemeProp, setPrevThemeProp] = useState(themeProp)
  // Follow the prop when it changes (React's "adjust state on a prop change" pattern).
  if (themeProp !== prevThemeProp) {
    setPrevThemeProp(themeProp)
    setThemeState(themeProp)
  }

  // The latest explicit choice: a `mode` prop, or a `setMode` call. Unset until one happens.
  const [chosenMode, setChosenMode] = useState<ColorMode | undefined>(modeProp)
  const [prevModeProp, setPrevModeProp] = useState(modeProp)
  if (modeProp !== prevModeProp) {
    setPrevModeProp(modeProp)
    if (modeProp) setChosenMode(modeProp)
  }
  // A stored choice wins over `defaultMode`, uncontrolled only.
  const storedMode = useStoredMode(persistMode && !modeProp, storageKey)
  const modeState = chosenMode ?? storedMode ?? defaultMode

  useEffect(() => {
    if (target !== 'document' || typeof document === 'undefined') return
    const el = document.documentElement
    el.dataset.theme = themeState
    el.dataset.mode = modeState
  }, [target, themeState, modeState])

  const systemDark = useSystemDark()
  const resolvedMode = modeState === 'system' ? (systemDark ? 'dark' : 'light') : modeState

  const setTheme = useCallback(
    (t: ThemeName) => {
      setThemeState(t)
      onThemeChange?.(t)
    },
    [onThemeChange],
  )

  const setMode = useCallback(
    (m: ColorMode) => {
      setChosenMode(m)
      if (persistMode && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(storageKey, m)
        } catch {
          /* storage unavailable — ignore */
        }
      }
      onModeChange?.(m)
    },
    [onModeChange, persistMode, storageKey],
  )

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: themeState, mode: modeState, resolvedMode, setTheme, setMode }),
    [themeState, modeState, resolvedMode, setTheme, setMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export interface ThemeScopeProps extends HTMLAttributes<HTMLDivElement> {
  theme: ThemeName
  /** Omit to inherit the surrounding colour mode (the usual case). */
  mode?: ColorMode
  /**
   * Paint the theme's canvas (background, text colour, base type) on the scope.
   * Default `true`. Set `false` to drop a themed component into a rounded frame or
   * a surface without a square background.
   */
  paint?: boolean
}

/**
 * Renders a subtree in a different theme (and optionally mode). Themes are plain CSS
 * scoped to `[data-theme]`, so scopes nest freely — e.g. a Fiesta card previewed on a
 * Monograph page. Also paints the theme's page background and text colour.
 */
export const ThemeScope = forwardRef<HTMLDivElement, ThemeScopeProps>(function ThemeScope(
  { theme, mode, paint = true, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      data-theme={theme}
      data-mode={mode}
      data-kiln-scope={paint ? '' : undefined}
      data-kiln-scope-bare={paint ? undefined : ''}
      {...rest}
    />
  )
})
