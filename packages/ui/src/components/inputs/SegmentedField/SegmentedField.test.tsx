import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SegmentedField } from './SegmentedField'

const periods = [
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
]

describe('SegmentedField', () => {
  it('labels the radiogroup with the Field label and describes it with help and error', () => {
    render(
      <SegmentedField
        label="Billing period"
        description="Totals reset at the start of each"
        error="Choose a period"
        options={periods}
        required
      />,
    )
    const group = screen.getByRole('radiogroup', { name: 'Billing period' })
    expect(group).toHaveAccessibleDescription('Totals reset at the start of each Choose a period')
    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(group).toHaveAttribute('aria-required', 'true')
    expect(group).toHaveAttribute('data-invalid')
  })

  it('sends ref and id to the control and className to the Field', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <SegmentedField
        ref={ref}
        id="period"
        className="extra"
        label="Billing period"
        options={periods}
      />,
    )
    expect(ref.current).toBe(screen.getByRole('radiogroup'))
    expect(ref.current).toHaveAttribute('id', 'period')
    expect(container.firstElementChild).toHaveClass('extra')
  })

  it('readOnly ignores changes and sets aria-readonly', async () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedField
        label="Billing period"
        options={periods}
        readOnly
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-readonly', 'true')
    await userEvent.click(screen.getByRole('radio', { name: 'Year' }))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('radio', { name: 'Month' })).toHaveAttribute('aria-checked', 'true')
  })

  it('disabled from the Field disables every segment', () => {
    render(<SegmentedField label="Billing period" options={periods} disabled />)
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled()
  })

  it('validating sets aria-busy', () => {
    render(<SegmentedField label="Billing period" options={periods} validating />)
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-busy', 'true')
  })

  it('submits the selected value under name', async () => {
    const { container } = render(
      <form>
        <SegmentedField
          label="Billing period"
          name="period"
          options={periods}
          defaultValue="quarter"
        />
      </form>,
    )
    const form = container.querySelector('form')
    if (!form) throw new Error('no form')
    expect(new FormData(form).get('period')).toBe('quarter')
    await userEvent.click(screen.getByRole('radio', { name: 'Year' }))
    expect(new FormData(form).get('period')).toBe('year')
  })

  it('fires onBlur once, when focus leaves the control', async () => {
    const onBlur = vi.fn()
    render(
      <>
        <SegmentedField label="Billing period" options={periods} onBlur={onBlur} />
        <button type="button">Save</button>
      </>,
    )
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(onBlur).not.toHaveBeenCalled()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
