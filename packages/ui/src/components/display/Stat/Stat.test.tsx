import { render, screen } from '@testing-library/react'
import { Stat } from './Stat'
import { must } from '#test/must'

describe('Stat', () => {
  it('is a group named by its label', () => {
    render(<Stat label="Spent" value="$4,812.40" hint="of $6,200.00 budgeted" />)
    const group = screen.getByRole('group', { name: 'Spent' })
    expect(group).toHaveTextContent('$4,812.40')
    expect(group).toHaveTextContent('of $6,200.00 budgeted')
    expect(group).toHaveAttribute('data-size', 'md')
  })

  it('announces the delta direction in words and derives the tone from it', () => {
    render(<Stat label="Points" value="42" delta={{ value: '6', direction: 'up' }} />)
    const delta = must(screen.getByText('Up', { exact: false }).parentElement)
    expect(delta).toHaveAttribute('data-direction', 'up')
    expect(delta).toHaveAttribute('data-tone', 'positive')
    expect(delta).toHaveTextContent('Up 6')
  })

  it('lets the tone override the direction (spending up is bad)', () => {
    render(
      <Stat
        label="Spent"
        value="$4,812.40"
        delta={{ value: '$212.40', direction: 'up', tone: 'critical' }}
      />,
    )
    const delta = must(screen.getByText('Up', { exact: false }).parentElement)
    expect(delta).toHaveAttribute('data-tone', 'critical')
  })

  it('sets size and rule as data attributes', () => {
    render(<Stat label="Left to spend" value="$1,387.60" size="hero" rule />)
    const group = screen.getByRole('group', { name: 'Left to spend' })
    expect(group).toHaveAttribute('data-size', 'hero')
    expect(group).toHaveAttribute('data-rule')
  })

  it('sets the value tone, leaving default unmarked', () => {
    const { rerender } = render(<Stat label="Eating out" value="$412.50" tone="critical" />)
    expect(screen.getByRole('group', { name: 'Eating out' })).toHaveAttribute(
      'data-tone',
      'critical',
    )
    rerender(<Stat label="Eating out" value="$412.50" tone="default" />)
    expect(screen.getByRole('group', { name: 'Eating out' })).not.toHaveAttribute('data-tone')
  })
})
