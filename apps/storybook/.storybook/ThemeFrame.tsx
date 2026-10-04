import {
  DEFAULT_THEME,
  THEMES,
  THEME_META,
  ThemeProvider,
  ThemeScope,
  type BuiltInThemeName,
  type ColorMode,
} from '@mitcsutt/kiln-ui'
import { useEffect, type ReactNode } from 'react'

/** A built-in theme, or every theme side by side. */
export type ThemeGlobal = BuiltInThemeName | 'all'

interface ThemeFrameProps {
  theme: ThemeGlobal
  mode: ColorMode
  layout: string | undefined
  children: () => ReactNode
}

export function ThemeFrame({ theme, mode, layout, children }: ThemeFrameProps) {
  // The canvas page itself (its background, and portals such as dialogs and
  // tooltips that render outside the story root) follows the toolbar too.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme === 'all' ? DEFAULT_THEME : theme
    root.dataset.mode = mode
  }, [theme, mode])

  if (theme === 'all') {
    return (
      <ThemeProvider theme={DEFAULT_THEME} mode={mode} target="none" persistMode={false}>
        <div className="sb-matrix" data-layout={layout}>
          {THEMES.map((name) => (
            <ThemeScope key={name} theme={name} mode={mode} className="sb-matrix-cell">
              <p className="sb-matrix-label">{THEME_META[name].label}</p>
              {children()}
            </ThemeScope>
          ))}
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme} mode={mode} target="none" persistMode={false}>
      {children()}
    </ThemeProvider>
  )
}
