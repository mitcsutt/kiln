import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { ToggleChip } from './ToggleChip'

describe('ToggleChip', () => {
  it('is a toggle button with aria-pressed (uncontrolled)', async () => {
    const ref = createRef<HTMLButtonElement>()
    render(<ToggleChip ref={ref}>Mine</ToggleChip>)
    const chip = screen.getByRole('button', { name: 'Mine' })
    expect(ref.current).toBe(chip)
    expect(chip).toHaveAttribute('type', 'button')
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    expect(chip).toHaveAttribute('data-state', 'on')
  })

  it('supports controlled state and keyboard activation', async () => {
    const onPressedChange = vi.fn()
    function Controlled() {
      const [pressed, setPressed] = useState(true)
      return (
        <ToggleChip
          pressed={pressed}
          onPressedChange={(p) => {
            onPressedChange(p)
            setPressed(p)
          }}
        >
          Overdue only
        </ToggleChip>
      )
    }
    render(<Controlled />)
    const chip = screen.getByRole('button', { name: 'Overdue only' })
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    chip.focus()
    await userEvent.keyboard(' ')
    expect(onPressedChange).toHaveBeenCalledWith(false)
    expect(chip).toHaveAttribute('aria-pressed', 'false')
  })

  it('renders a count and size for theming', () => {
    render(
      <ToggleChip size="sm" count={12}>
        Overdue only
      </ToggleChip>,
    )
    const chip = screen.getByRole('button', { name: 'Overdue only 12' })
    expect(chip).toHaveAttribute('data-size', 'sm')
  })

  it('sets trailing content after the label, inside the button', () => {
    render(
      <ToggleChip trailing={<span>Noor, Kofi</span>} defaultPressed>
        Fire
      </ToggleChip>,
    )
    const chip = screen.getByRole('button', { name: /Fire/ })
    expect(chip).toHaveTextContent('FireNoor, Kofi')
    expect(screen.getByText('Noor, Kofi').parentElement?.previousElementSibling).toHaveTextContent(
      'Fire',
    )
  })
})
