import { render } from '@testing-library/react'
import { Inline } from './Inline'

describe('Inline', () => {
  it('maps gap and justify to responsive vars', () => {
    const { container } = render(<Inline gap={3} justify={{ base: 'start', md: 'between' }} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.getPropertyValue('--inline-gap-base')).toBe('var(--space-3)')
    expect(el.style.getPropertyValue('--inline-justify-base')).toBe('flex-start')
    expect(el.style.getPropertyValue('--inline-justify-lg')).toBe('space-between')
  })
  it('can disable wrapping', () => {
    const { container } = render(<Inline wrap={false} />)
    expect(container.firstElementChild).toHaveAttribute('data-wrap', 'false')
  })
})
