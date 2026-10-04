import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { SegmentedControl } from './SegmentedControl'

const periods = [
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
]

describe('SegmentedControl', () => {
  it('is a named radiogroup with the first segment selected by default', () => {
    const ref = createRef<HTMLDivElement>()
    render(<SegmentedControl ref={ref} aria-label="Period" options={periods} />)
    const group = screen.getByRole('radiogroup', { name: 'Period' })
    expect(ref.current).toBe(group)
    expect(screen.getByRole('radio', { name: 'Month' })).toHaveAttribute('aria-checked', 'true')
    expect(group.style.getPropertyValue('--_count')).toBe('3')
    expect(group.style.getPropertyValue('--_index')).toBe('0')
  })

  it('moves focus with arrow keys and selects with Space', async () => {
    const onValueChange = vi.fn()
    render(<SegmentedControl aria-label="Period" options={periods} onValueChange={onValueChange} />)
    const month = screen.getByRole('radio', { name: 'Month' })
    await userEvent.tab()
    expect(month).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    const quarter = screen.getByRole('radio', { name: 'Quarter' })
    expect(quarter).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    expect(month).toHaveFocus() // loops
    await userEvent.keyboard('{ArrowLeft} ')
    const year = screen.getByRole('radio', { name: 'Year' })
    expect(year).toHaveAttribute('aria-checked', 'true')
    expect(onValueChange).toHaveBeenLastCalledWith('year')
    expect(screen.getByRole('radiogroup').style.getPropertyValue('--_index')).toBe('2')
  })

  it('never deselects the current segment', async () => {
    const onValueChange = vi.fn()
    render(<SegmentedControl aria-label="Period" options={periods} onValueChange={onValueChange} />)
    const month = screen.getByRole('radio', { name: 'Month' })
    await userEvent.click(month)
    expect(month).toHaveAttribute('aria-checked', 'true')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('supports controlled Item children', async () => {
    function Controlled() {
      const [view, setView] = useState('table')
      return (
        <SegmentedControl aria-label="View" value={view} onValueChange={setView}>
          <SegmentedControl.Item value="groups">Groups</SegmentedControl.Item>
          <SegmentedControl.Item value="table">Table</SegmentedControl.Item>
          <SegmentedControl.Item value="bracket">Bracket</SegmentedControl.Item>
        </SegmentedControl>
      )
    }
    render(<Controlled />)
    expect(screen.getByRole('radio', { name: 'Table' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(screen.getByRole('radio', { name: 'Bracket' }))
    expect(screen.getByRole('radio', { name: 'Bracket' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radiogroup').style.getPropertyValue('--_index')).toBe('2')
  })

  it('names icon-only segments by their label', () => {
    render(
      <SegmentedControl
        aria-label="Colour mode"
        iconOnly
        options={[
          { value: 'light', label: 'Light', icon: <svg /> },
          { value: 'dark', label: 'Dark', icon: <svg /> },
        ]}
      />,
    )
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeInTheDocument()
  })

  it('writes per-breakpoint attributes for responsive size and fullWidth', () => {
    render(
      <SegmentedControl
        aria-label="Squad view"
        options={periods}
        size={{ base: 'lg', md: 'md' }}
        fullWidth={{ base: true, md: false }}
      />,
    )
    const group = screen.getByRole('radiogroup')
    expect(group).toHaveAttribute('data-size', 'lg')
    expect(group).toHaveAttribute('data-size-md', 'md')
    expect(group).toHaveAttribute('data-full-width', '')
    expect(group).toHaveAttribute('data-full-width-md', 'false')
    expect(group).not.toHaveAttribute('data-size-sm')
  })

  it('keeps plain size and fullWidth values on the base attributes', () => {
    render(<SegmentedControl aria-label="Period" options={periods} size="sm" />)
    const group = screen.getByRole('radiogroup')
    expect(group).toHaveAttribute('data-size', 'sm')
    expect(group).not.toHaveAttribute('data-full-width')
  })
})
