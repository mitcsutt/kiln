import { themeScript } from '@mitcsutt/kiln-ui/theme-script'
import { renderToStaticMarkup } from 'react-dom/server'
import type { SiteConfig } from '../../config.ts'
import { testConfig } from '../../fixtures.ts'
import { createRootLayout } from '../../layouts/root.tsx'
import { DocsThemeProvider } from '../DocsThemeProvider.tsx'
import { SiteConfigProvider } from '../SiteConfig.tsx'
import { ThemeSwitcher } from './ThemeSwitcher.tsx'

const withTheme = (theme: SiteConfig['theme']): SiteConfig => ({ ...testConfig, theme })

/** The header's theme controls, rendered on the server as a site's first paint is. */
function controls(theme: SiteConfig['theme']): string {
  const config = withTheme(theme)
  return renderToStaticMarkup(
    <SiteConfigProvider config={config}>
      <DocsThemeProvider>
        <ThemeSwitcher />
      </DocsThemeProvider>
    </SiteConfigProvider>,
  )
}

const THEME_SELECT = 'aria-label="Theme"'
const MODE_TOGGLE = 'aria-label="Colour mode'

describe("the header's theme controls", () => {
  it('offer a picker and the mode toggle on a site with a picker', () => {
    const view = controls({ picker: ['paper', 'riso'], default: 'paper' })
    expect(view).toContain(THEME_SELECT)
    expect(view).toContain(MODE_TOGGLE)
  })

  // ADR 0046: a fixed theme renders no picker, only the mode toggle.
  it('offer only the mode toggle on a site with a fixed theme', () => {
    const view = controls({ fixed: 'flightdeck' })
    expect(view).not.toContain(THEME_SELECT)
    expect(view).toContain(MODE_TOGGLE)
  })

  it('are nothing with a fixed theme and modeToggle: false', () => {
    expect(controls({ fixed: 'flightdeck', modeToggle: false })).toBe('')
  })
})

describe('the root layout', () => {
  const document = (theme: SiteConfig['theme']) => {
    const RootLayout = createRootLayout({ config: withTheme(theme) })
    return renderToStaticMarkup(<RootLayout>page</RootLayout>)
  }

  it("starts on the fixed theme, with kiln-ui's head script", () => {
    const view = document({ fixed: 'flightdeck' })
    expect(view).toContain('<html lang="en" data-theme="flightdeck" data-mode="system">')
    expect(view).toContain(
      `<script>${themeScript('flightdeck', 'system', { storageKey: 'kiln-color-mode' })}</script>`,
    )
  })

  it("starts on the picker's default, reading the reader's pick", () => {
    const view = document({ picker: ['paper', 'riso'], default: 'riso' })
    expect(view).toContain('<html lang="en" data-theme="riso" data-mode="system">')
    expect(view).toContain('localStorage.getItem("kiln-docs-theme")')
  })
})
