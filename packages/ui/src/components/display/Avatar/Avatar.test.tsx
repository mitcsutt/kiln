import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Avatar } from './Avatar'
import { avatarColor, getInitials } from './avatarUtils'

describe('getInitials', () => {
  it('takes the first letter of the first and last words', () => {
    expect(getInitials('Ada Okafor')).toBe('AO')
    expect(getInitials('  jean-luc  picard ')).toBe('JP')
    expect(getInitials('Ana María de la Cruz')).toBe('AC')
  })

  it('uses one letter for a single name and nothing for an empty one', () => {
    expect(getInitials('Kofi')).toBe('K')
    expect(getInitials('   ')).toBe('')
  })
})

describe('avatarColor', () => {
  it('is deterministic and ignores case and surrounding space', () => {
    expect(avatarColor('Noor')).toBe(avatarColor('Noor'))
    expect(avatarColor('Noor')).toBe(avatarColor('  noor '))
  })

  it('always returns a slot from 1 to 8 and spreads names across slots', () => {
    const names = [
      'Noor',
      'Kofi',
      'Ada',
      'Ingrid',
      'Mei',
      'Theo',
      'Amara',
      'Diego',
      'Lena',
      'Yusuf',
      'Hana',
      'Oskar',
    ]
    const slots = names.map(avatarColor)
    for (const slot of slots) {
      expect(slot).toBeGreaterThanOrEqual(1)
      expect(slot).toBeLessThanOrEqual(8)
    }
    expect(new Set(slots).size).toBeGreaterThan(3)
  })
})

describe('Avatar', () => {
  it('shows initials with an accessible name and the name-derived colour', () => {
    const ref = createRef<HTMLSpanElement>()
    const { container } = render(<Avatar ref={ref} name="Ada Okafor" size="lg" />)
    const img = screen.getByRole('img', { name: 'Ada Okafor' })
    expect(img).toHaveTextContent('AO')
    const root = container.firstElementChild as HTMLElement
    expect(ref.current).toBe(root)
    expect(root).toHaveAttribute('data-size', 'lg')
    expect(root).toHaveAttribute('data-color', String(avatarColor('Ada Okafor')))
  })

  it('renders the same colour for the same name across renders', () => {
    const { container: a } = render(<Avatar name="Kofi" />)
    const { container: b } = render(<Avatar name="Kofi" />)
    expect((a.firstElementChild as HTMLElement).dataset.color).toBe(
      (b.firstElementChild as HTMLElement).dataset.color,
    )
  })

  it('lets an explicit colour and alt override the defaults', () => {
    const { container } = render(<Avatar name="Noor" alt="Noor (you)" color={3} ring />)
    const root = container.firstElementChild as HTMLElement
    expect(root).toHaveAttribute('data-color', '3')
    expect(root).toHaveAttribute('data-ring')
    expect(screen.getByRole('img', { name: 'Noor (you)' })).toBeInTheDocument()
  })

  it('is hidden from assistive tech when alt is empty', () => {
    render(<Avatar name="Noor" alt="" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('falls back to initials while an image has not loaded', () => {
    render(<Avatar name="Ingrid Tran" src="/avatars/ingrid.jpg" />)
    // jsdom never loads images, so Radix keeps showing the fallback (after its delay).
    expect(screen.queryByRole('img', { name: 'Ingrid Tran' })?.tagName ?? 'SPAN').not.toBe('IMG')
  })

  it('uses explicit initials and marks three-letter codes', () => {
    const { container } = render(<Avatar name="Northwind Studio" initials="nws" />)
    expect(screen.getByRole('img', { name: 'Northwind Studio' })).toHaveTextContent('NWS')
    expect(container.querySelector('[data-glyphs="many"]')).not.toBeNull()
  })

  it('keeps two-letter initials at the normal size', () => {
    const { container } = render(<Avatar name="Ingrid Tran" />)
    expect(screen.getByRole('img', { name: 'Ingrid Tran' })).toHaveTextContent('IT')
    expect(container.querySelector('[data-glyphs]')).toBeNull()
  })
})
