import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Meter } from './Meter'
import { meterTone } from './meterTone'

const budget = { min: 0, max: 680, low: 510, high: 680, optimum: 0 }

describe('meterTone', () => {
  it('follows <meter> regions when less is better (a budget)', () => {
    expect(meterTone(272, budget)).toBe('positive') // 40%
    expect(meterTone(578, budget)).toBe('caution') // 85%
    expect(meterTone(680, budget)).toBe('caution') // exactly on the limit
    expect(meterTone(748, budget)).toBe('critical') // 110% — past max still counts
  })

  it('follows <meter> regions when more is better (savings)', () => {
    const savings = { min: 0, max: 10_000, low: 3_000, high: 8_000, optimum: 10_000 }
    expect(meterTone(9_000, savings)).toBe('positive')
    expect(meterTone(5_000, savings)).toBe('caution')
    expect(meterTone(1_000, savings)).toBe('critical')
  })

  it('treats a middle optimum as good in the middle and caution either side', () => {
    const t = { min: 0, max: 100, low: 30, high: 70, optimum: 50 }
    expect(meterTone(50, t)).toBe('positive')
    expect(meterTone(10, t)).toBe('caution')
    expect(meterTone(95, t)).toBe('caution')
  })
})

describe('Meter', () => {
  it('is a labelled meter with clamped aria values and value text', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Meter ref={ref} label="Groceries" value={748} {...budget} valueLabel="$748.00 of $680.00" />,
    )
    const meter = screen.getByRole('meter', { name: 'Groceries' })
    expect(ref.current).toBe(meter)
    expect(meter).toHaveAttribute('aria-valuenow', '680')
    expect(meter).toHaveAttribute('aria-valuemax', '680')
    expect(meter).toHaveAttribute('aria-valuetext', '$748.00 of $680.00')
    expect(meter).toHaveAttribute('data-tone', 'critical')
    expect(meter).toHaveAttribute('data-over')
  })

  it('derives the tone from thresholds at 40%, 85% and 110%', () => {
    const { rerender } = render(
      <Meter aria-label="Dining out" value={0.4} max={1} low={0.75} high={1} optimum={0} />,
    )
    expect(screen.getByRole('meter')).toHaveAttribute('data-tone', 'positive')
    rerender(<Meter aria-label="Dining out" value={0.85} max={1} low={0.75} high={1} optimum={0} />)
    expect(screen.getByRole('meter')).toHaveAttribute('data-tone', 'caution')
    rerender(<Meter aria-label="Dining out" value={1.1} max={1} low={0.75} high={1} optimum={0} />)
    expect(screen.getByRole('meter')).toHaveAttribute('data-tone', 'critical')
    expect(screen.getByText('110%')).toBeInTheDocument()
  })

  it('uses accent without thresholds and honours an explicit tone', () => {
    const { rerender } = render(<Meter aria-label="Storage" value={0.3} />)
    expect(screen.getByRole('meter')).toHaveAttribute('data-tone', 'accent')
    rerender(<Meter aria-label="Storage" value={0.3} low={0.1} tone="info" />)
    expect(screen.getByRole('meter')).toHaveAttribute('data-tone', 'info')
  })

  it('renders segment ticks', () => {
    const { container } = render(<Meter aria-label="Steps" value={3} max={8} segments={8} />)
    expect(container.querySelectorAll('[style*="--meter-tick"]')).toHaveLength(7)
  })
})
