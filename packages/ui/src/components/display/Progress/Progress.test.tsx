import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Progress } from './Progress'
import { must } from '#test/must'

describe('Progress', () => {
  it('is a labelled progressbar with value text', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Progress ref={ref} label="Importing transactions" value={42} showValue />)
    const bar = screen.getByRole('progressbar', { name: 'Importing transactions' })
    expect(ref.current).toBe(bar)
    expect(bar).toHaveAttribute('aria-valuenow', '42')
    expect(bar).toHaveAttribute('aria-valuetext', '42%')
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('clamps out-of-range values and uses a custom formatter', () => {
    render(
      <Progress
        aria-label="Import"
        value={60}
        max={48}
        formatValue={(v, m) => `${String(v)} of ${String(m)} files`}
      />,
    )
    const bar = screen.getByRole('progressbar', { name: 'Import' })
    expect(bar).toHaveAttribute('aria-valuenow', '48')
    expect(bar).toHaveAttribute('aria-valuetext', '48 of 48 files')
  })

  it('is indeterminate without a value', () => {
    render(<Progress aria-label="Syncing" />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('data-state', 'indeterminate')
    expect(bar).not.toHaveAttribute('aria-valuenow')
  })

  it('puts tone and size on the wrapper', () => {
    const { container } = render(
      <Progress aria-label="Upload" value={10} tone="positive" size="lg" className="x" />,
    )
    const wrapper = must(container.firstElementChild)
    expect(wrapper).toHaveClass('x')
    expect(wrapper).toHaveAttribute('data-tone', 'positive')
    expect(wrapper).toHaveAttribute('data-size', 'lg')
  })
})
