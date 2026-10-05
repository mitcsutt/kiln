import { runInThisContext } from 'node:vm'
import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider, ThemeScope } from './ThemeProvider'
import { themeScript, useTheme } from './context'

function ModeProbe() {
  const { mode } = useTheme()
  return <span data-testid="mode">{mode}</span>
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts in defaultMode when nothing is stored', () => {
    render(
      <ThemeProvider theme="monograph" defaultMode="dark">
        <ModeProbe />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('mode')).toHaveTextContent('dark')
    expect(document.documentElement.dataset.mode).toBe('dark')
  })

  it('lets a stored choice win over defaultMode', async () => {
    localStorage.setItem('kiln-color-mode', 'light')
    render(
      <ThemeProvider theme="monograph" defaultMode="dark">
        <ModeProbe />
      </ThemeProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('mode')).toHaveTextContent('light'))
  })

  it('reads and writes the mode under a custom storageKey', async () => {
    localStorage.setItem('kiln-color-mode', 'dark')
    localStorage.setItem('my-app:mode', 'light')
    function ModeSetter() {
      const { mode, setMode } = useTheme()
      return (
        <button
          type="button"
          onClick={() => {
            setMode('system')
          }}
        >
          {mode}
        </button>
      )
    }
    render(
      <ThemeProvider defaultMode="dark" storageKey="my-app:mode">
        <ModeSetter />
      </ThemeProvider>,
    )
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('light'))
    screen.getByRole('button').click()
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('system'))
    expect(localStorage.getItem('my-app:mode')).toBe('system')
    expect(localStorage.getItem('kiln-color-mode')).toBe('dark')
  })
})

describe('custom and default themes', () => {
  function ThemeProbe() {
    const { theme, setTheme } = useTheme()
    return (
      <button
        type="button"
        onClick={() => {
          setTheme('my-brand-night')
        }}
      >
        {theme}
      </button>
    )
  }

  it('defaults to paper', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    )
    expect(screen.getByRole('button')).toHaveTextContent('paper')
    expect(document.documentElement.dataset.theme).toBe('paper')
  })

  it('accepts a consumer-defined theme name in the provider, useTheme and ThemeScope', async () => {
    render(
      <ThemeProvider theme="my-brand">
        <ThemeProbe />
        <ThemeScope theme="my-brand-inset" data-testid="scope" />
      </ThemeProvider>,
    )
    expect(document.documentElement.dataset.theme).toBe('my-brand')
    expect(screen.getByTestId('scope')).toHaveAttribute('data-theme', 'my-brand-inset')
    screen.getByRole('button').click()
    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('my-brand-night')
    })
  })
})

describe('themeScript', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('applies defaultMode before paint when nothing is stored', () => {
    runInThisContext(themeScript('ledger', 'light'))
    expect(document.documentElement.dataset.theme).toBe('ledger')
    expect(document.documentElement.dataset.mode).toBe('light')
  })

  it('defaults to paper and accepts a consumer-defined theme', () => {
    runInThisContext(themeScript())
    expect(document.documentElement.dataset.theme).toBe('paper')
    runInThisContext(themeScript('my-brand', 'dark'))
    expect(document.documentElement.dataset.theme).toBe('my-brand')
  })

  it('cannot close its own script tag, whatever the theme name', () => {
    const script = themeScript('</script><script>alert(1)</script>')
    expect(script).not.toContain('</script>')
    runInThisContext(script)
    expect(document.documentElement.dataset.theme).toBe('</script><script>alert(1)</script>')
  })

  it('prefers the stored mode', () => {
    localStorage.setItem('kiln-color-mode', 'dark')
    runInThisContext(themeScript('ledger', 'light'))
    expect(document.documentElement.dataset.mode).toBe('dark')
  })

  it('reads the mode from a custom storageKey', () => {
    localStorage.setItem('kiln-color-mode', 'dark')
    runInThisContext(themeScript('ledger', 'light', { storageKey: 'my-app:mode' }))
    expect(document.documentElement.dataset.mode).toBe('light')
    localStorage.setItem('my-app:mode', 'system')
    runInThisContext(themeScript('ledger', 'light', { storageKey: 'my-app:mode' }))
    expect(document.documentElement.dataset.mode).toBe('system')
  })

  it('cannot close its own script tag, whatever the storage key', () => {
    const script = themeScript('paper', 'light', { storageKey: '</script>' })
    expect(script).not.toContain('</script>')
  })
})
