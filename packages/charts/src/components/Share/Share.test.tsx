import { render, screen, within } from '@testing-library/react'

import { expectNoAxeViolations } from '#test/a11y'

import { Share } from './Share'

const CHANNELS = [{ search: 5200, email: 1800, social: 2400, referral: 600 }]

describe('Share', () => {
  it('lists every part with its share and amount, largest first', () => {
    render(<Share data={CHANNELS} label="Visits by channel" locale="en-AU" />)
    const legend = screen.getByRole('list', { name: 'Visits by channel: parts' })
    expect(
      within(legend)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['Search52% · 5,200', 'Social24% · 2,400', 'Email18% · 1,800', 'Referral6% · 600'])
  })

  it('draws one ring slice per part and the total in the middle', () => {
    const { container } = render(
      <Share data={CHANNELS} label="Visits by channel" totalLabel="visits" locale="en-AU" />,
    )
    expect(container.querySelectorAll('circle[data-key]')).toHaveLength(4)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('10,000')).toBeInTheDocument()
    expect(screen.getByText('visits')).toBeInTheDocument()
  })

  it('summarises the shares and tables them', () => {
    render(<Share data={CHANNELS} label="Visits by channel" locale="en-AU" />)
    expect(screen.getByRole('figure')).toHaveAccessibleDescription(
      '4 parts of 10,000. Search: 52% (5,200). Social: 24% (2,400). Email: 18% (1,800). Referral: 6% (600).',
    )
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows[1]?.textContent).toBe('Search5,20052%')
  })

  it('takes long rows through pivot, grouping past eight parts as Other, last', () => {
    const plans = Array.from({ length: 10 }, (_, i) => ({
      plan: `Plan ${String(i + 1)}`,
      seats: 100 - i,
    }))
    render(<Share data={plans} label="Seats by plan" pivot={{ by: 'plan', value: 'seats' }} />)
    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(8)
    expect(items.at(-1)).toHaveTextContent(/^Other/)
  })

  it('shows pivoted names as written, and humanises only wide keys', () => {
    const platforms = [
      { platform: 'iOS', visits: 600 },
      { platform: 'macOS', visits: 400 },
    ]
    render(
      <Share
        data={platforms}
        label="Visits by platform"
        pivot={{ by: 'platform', value: 'visits' }}
        locale="en-AU"
      />,
    )
    const legend = screen.getByRole('list', { name: 'Visits by platform: parts' })
    expect(
      within(legend)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['iOS60% · 600', 'macOS40% · 400'])
    expect(screen.getByRole('figure')).toHaveAccessibleDescription(
      '2 parts of 1,000. iOS: 60% (600). macOS: 40% (400).',
    )
    expect(within(screen.getByRole('table')).getAllByRole('row')[1]?.textContent).toBe(
      'iOS60060%',
    )
  })

  it('pins colours by key', () => {
    const { container } = render(
      <Share data={CHANNELS} label="Visits" colors={{ email: 'cat-6' }} />,
    )
    expect(container.querySelector('circle[data-key="email"]')).toHaveAttribute(
      'stroke',
      'var(--color-cat-6)',
    )
  })

  it('shows the empty state with nothing to share', () => {
    render(<Share data={[]} label="Visits" />)
    expect(screen.getByText('No data to show')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<Share data={CHANNELS} label="Visits by channel" />)
    await expectNoAxeViolations(container)
  })
})
