import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '#theme'
import { ModeToggle } from './ModeToggle'

function renderInTheme(ui: React.ReactNode) {
  return render(
    <ThemeProvider mode="light" target="none" persistMode={false}>
      {ui}
    </ThemeProvider>,
  )
}

describe('ModeToggle', () => {
  it('cycles light → dark → system → light', async () => {
    renderInTheme(<ModeToggle />)
    const btn = screen.getByRole('button', { name: /Colour mode: Light/ })
    expect(btn).toHaveAccessibleName('Colour mode: Light. Switch to dark')
    await userEvent.click(btn)
    expect(btn).toHaveAccessibleName(/Colour mode: Dark/)
    await userEvent.click(btn)
    expect(btn).toHaveAccessibleName(/Colour mode: System/)
    await userEvent.click(btn)
    expect(btn).toHaveAccessibleName(/Colour mode: Light/)
  })

  it('segmented variant selects a mode directly', async () => {
    renderInTheme(<ModeToggle variant="segmented" />)
    expect(screen.getByRole('radiogroup', { name: 'Colour mode' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Light' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(screen.getByRole('radio', { name: 'System' }))
    expect(screen.getByRole('radio', { name: 'System' })).toHaveAttribute('aria-checked', 'true')
  })

  it('throws outside a ThemeProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => render(<ModeToggle />)).toThrow(/ThemeProvider/)
    spy.mockRestore()
  })
})
