import { render, screen, within } from '@testing-library/react'

import { expectNoAxeViolations } from '#test/a11y'

import { BarList } from './BarList'

const PAGES = [
  { page: '/pricing', views: 1840 },
  { page: '/docs/install', views: 3120 },
  { page: '/changelog', views: 960 },
]

describe('BarList', () => {
  it('ranks long rows as an ordered list of names and amounts', () => {
    render(
      <BarList
        data={PAGES}
        label="Top pages"
        pivot={{ by: 'page', value: 'views' }}
        locale="en-AU"
      />,
    )
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('OL')
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['/docs/install3,120', '/pricing1,840', '/changelog960'])
  })

  it('sizes each bar against the largest', () => {
    const { container } = render(
      <BarList data={PAGES} label="Top pages" pivot={{ by: 'page', value: 'views' }} />,
    )
    const bars = [...container.querySelectorAll<HTMLElement>('[aria-hidden="true"]')]
    expect(bars.map((bar) => bar.style.getPropertyValue('--_size'))).toEqual([
      '100%',
      `${String((1840 / 3120) * 100)}%`,
      `${String((960 / 3120) * 100)}%`,
    ])
  })

  it('takes a wide row, keeps order with sort none, and shows the top few with max', () => {
    render(
      <BarList
        data={[{ harbour: 12, quay: 30, riverside: 21 }]}
        label="Stops"
        sort="none"
        max={2}
      />,
    )
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Harbour12',
      'Quay30',
    ])
  })

  it('is named and summarised', () => {
    render(
      <BarList
        data={PAGES}
        label="Top pages"
        pivot={{ by: 'page', value: 'views' }}
        locale="en-AU"
      />,
    )
    expect(screen.getByRole('figure', { name: 'Top pages' })).toHaveAccessibleDescription(
      '3 items. The largest is /docs/install at 3,120.',
    )
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <BarList data={PAGES} label="Top pages" pivot={{ by: 'page', value: 'views' }} />,
    )
    await expectNoAxeViolations(container)
  })
})
