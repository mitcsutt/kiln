import { render } from '@testing-library/react'
import { Split } from './Split'

describe('Split', () => {
  it('derives the column template from ratio', () => {
    const { container } = render(
      <Split ratio="1/3">
        <div>Groups</div>
        <div>Fixtures</div>
      </Split>,
    )
    const el = container.firstElementChild as HTMLElement
    expect(el.style.getPropertyValue('--split-columns')).toBe('minmax(0, 1fr) minmax(0, 3fr)')
    expect(el).toHaveAttribute('data-collapse-below', 'md')
    expect(el).toHaveAttribute('data-ratio', '1/3')
  })

  it('swaps the tracks when reversed so the first child keeps its share', () => {
    const { container } = render(
      <Split ratio="5/7" reverse collapseBelow="lg">
        <div>Copy</div>
        <div>Media</div>
      </Split>,
    )
    const el = container.firstElementChild as HTMLElement
    expect(el.style.getPropertyValue('--split-columns')).toBe('minmax(0, 7fr) minmax(0, 5fr)')
    expect(el).toHaveAttribute('data-reverse')
    expect(el).toHaveAttribute('data-collapse-below', 'lg')
    // DOM order is never changed — only the visual order when split.
    expect(el.firstElementChild).toHaveTextContent('Copy')
  })

  it('maps gap and align to responsive vars', () => {
    const { container } = render(
      <Split gap={{ base: 5, md: 7 }} align="center">
        <div />
        <div />
      </Split>,
    )
    const el = container.firstElementChild as HTMLElement
    expect(el.style.getPropertyValue('--split-gap-sm')).toBe('var(--space-5)')
    expect(el.style.getPropertyValue('--split-gap-md')).toBe('var(--space-7)')
    expect(el.style.getPropertyValue('--split-align-base')).toBe('center')
  })
})
