import { themeScript } from '@mitcsutt/kiln-ui/theme-script'
import { runInNewContext } from 'node:vm'
import { testConfig } from './fixtures.ts'
import { docsThemeScript, initialTheme, isPickerTheme } from './theme.ts'

const config = { theme: { picker: ['paper', 'riso'], default: 'paper' } }
const fixed = { theme: { fixed: 'flightdeck' } }

/** Runs the head script against a document and storage, and returns what it set. */
function run(script: string, stored: Record<string, string>) {
  const dataset: Record<string, string> = {}
  const localStorage = { getItem: (key: string) => stored[key] ?? null }
  runInNewContext(script, { document: { documentElement: { dataset } }, localStorage })
  return dataset
}

describe('the theme head script', () => {
  // ADR 0046: the keys a reader's saved choices live under never change.
  it("reads the reader's theme and colour mode from Kiln's keys", () => {
    const script = docsThemeScript(config)
    expect(script).toContain('localStorage.getItem("kiln-docs-theme")')
    expect(script).toContain('localStorage.getItem("kiln-color-mode")')
    expect(run(script, { 'kiln-docs-theme': 'riso', 'kiln-color-mode': 'dark' })).toEqual({
      theme: 'riso',
      mode: 'dark',
    })
  })

  it('starts on the default theme and the system mode when nothing usable is stored', () => {
    expect(run(docsThemeScript(config), {})).toEqual({ theme: 'paper', mode: 'system' })
    expect(
      run(docsThemeScript(config), { 'kiln-docs-theme': 'ledger', 'kiln-color-mode': 'dim' }),
    ).toEqual({ theme: 'paper', mode: 'system' })
  })

  it("can't be closed by a theme name", () => {
    const script = docsThemeScript({ theme: { picker: ['</script>'], default: '</script>' } })
    expect(script).not.toContain('</script>')
  })
})

describe('the head script for a fixed theme', () => {
  // ADR 0046: a fixed theme is kiln-ui's own head script, with the theme a constant.
  it("is kiln-ui's themeScript, with the mode under Kiln's key", () => {
    expect(docsThemeScript(fixed)).toBe(
      themeScript('flightdeck', 'system', { storageKey: 'kiln-color-mode' }),
    )
  })

  it('sets the fixed theme whatever is stored, and reads only the mode', () => {
    const script = docsThemeScript(fixed)
    expect(script).not.toContain('kiln-docs-theme')
    expect(run(script, { 'kiln-docs-theme': 'riso', 'kiln-color-mode': 'dark' })).toEqual({
      theme: 'flightdeck',
      mode: 'dark',
    })
    expect(run(script, {})).toEqual({ theme: 'flightdeck', mode: 'system' })
  })
})

describe('isPickerTheme', () => {
  it('accepts only the themes the picker offers', () => {
    expect(isPickerTheme(config, 'riso')).toBe(true)
    expect(isPickerTheme(config, 'ledger')).toBe(false)
    expect(isPickerTheme(testConfig, null)).toBe(false)
  })

  it('accepts nothing for a fixed theme, which has no picker', () => {
    expect(isPickerTheme(fixed, 'flightdeck')).toBe(false)
  })
})

describe('initialTheme', () => {
  it("is the picker's default, or the fixed theme", () => {
    expect(initialTheme(config)).toBe('paper')
    expect(initialTheme(fixed)).toBe('flightdeck')
  })
})
