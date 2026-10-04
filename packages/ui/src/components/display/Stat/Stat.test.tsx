import { render, screen } from '@testing-library/react'
import { Stat } from './Stat'
import { must } from '#test/must'

describe('Stat', () => {
  it('is a group named by its label', () => {
    render(<Stat label="Costs" value="$4,812.40" hint="of $6,200.00 forecast" />)
    const group = screen.getByRole('group', { name: 'Costs' })
    expect(group).toHaveTextContent('$4,812.40')
    expect(group).toHaveTextContent('of $6,200.00 forecast')
    expect(group).toHaveAttribute('data-size', 'md')
  })

  it('announces the delta direction in words and derives the tone from it', () => {
    render(<Stat label="Reviews" value="42" delta={{ value: '6', direction: 'up' }} />)
    const delta = must(screen.getByText('Up', { exact: false }).parentElement)
    expect(delta).toHaveAttribute('data-direction', 'up')
    expect(delta).toHaveAttribute('data-tone', 'positive')
    expect(delta).toHaveTextContent('Up 6')
  })

  it('lets the tone override the direction (costs up is bad)', () => {
    render(
      <Stat
        label="Costs"
        value="$4,812.40"
        delta={{ value: '$212.40', direction: 'up', tone: 'critical' }}
      />,
    )
    const delta = must(screen.getByText('Up', { exact: false }).parentElement)
    expect(delta).toHaveAttribute('data-tone', 'critical')
  })

  it('sets size and rule as data attributes', () => {
    render(<Stat label="Revenue" value="$48,120.40" size="hero" rule />)
    const group = screen.getByRole('group', { name: 'Revenue' })
    expect(group).toHaveAttribute('data-size', 'hero')
    expect(group).toHaveAttribute('data-rule')
  })

  it('sets the value tone, leaving default unmarked', () => {
    const { rerender } = render(<Stat label="Cloud hosting" value="$412.50" tone="critical" />)
    expect(screen.getByRole('group', { name: 'Cloud hosting' })).toHaveAttribute(
      'data-tone',
      'critical',
    )
    rerender(<Stat label="Cloud hosting" value="$412.50" tone="default" />)
    expect(screen.getByRole('group', { name: 'Cloud hosting' })).not.toHaveAttribute('data-tone')
  })
})
