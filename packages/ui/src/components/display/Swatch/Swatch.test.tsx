import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Badge } from '#components/display/Badge'
import { Tag } from '#components/display/Tag'
import { ToggleChip } from '#components/actions/ToggleChip'
import { must } from '#test/must'
import { Swatch } from './Swatch'

describe('Swatch', () => {
  it('maps a categorical slot to data-color and forwards refs', () => {
    const ref = createRef<HTMLSpanElement>()
    const { container } = render(<Swatch ref={ref} color={3} />)
    const swatch = must(container.firstElementChild)
    expect(ref.current).toBe(swatch)
    expect(swatch).toHaveAttribute('data-color', '3')
    expect(swatch).toHaveAttribute('data-size', 'md')
    expect(swatch.getAttribute('style')).toBeNull()
  })

  it('writes a CSS colour from data inline, merged with style', () => {
    const { container } = render(<Swatch color="#7c3aed" size="lg" style={{ marginInline: 4 }} />)
    const swatch = must(container.firstElementChild) as HTMLElement
    expect(swatch).not.toHaveAttribute('data-color')
    expect(swatch.style.getPropertyValue('--_swatch')).toBe('#7c3aed')
    expect(swatch.style.marginInline).toBe('4px')
    expect(swatch).toHaveAttribute('data-size', 'lg')
  })

  it('is decorative without a label and an image with one', () => {
    const { container, rerender } = render(<Swatch color={1} />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    rerender(<Swatch color={1} label="Platform team" />)
    expect(screen.getByRole('img', { name: 'Platform team' })).not.toHaveAttribute('aria-hidden')
  })
})

describe('the swatch prop', () => {
  it('draws a decorative swatch on a Badge in place of its dot', () => {
    render(
      <Badge swatch={5} dot>
        Platform
      </Badge>,
    )
    const badge = screen.getByText('Platform')
    const marks = badge.querySelectorAll('[aria-hidden="true"]')
    expect(marks).toHaveLength(1)
    expect(marks[0]).toHaveAttribute('data-color', '5')
    expect(badge).toHaveTextContent(/^Platform$/)
  })

  it('draws a swatch before a Tag label, as a link too', () => {
    render(
      <>
        <Tag swatch="#0b7285">Docs</Tag>
        <Tag swatch={2} asChild>
          <a href="/labels/design">Design</a>
        </Tag>
      </>,
    )
    const tag = screen.getByText('Docs')
    expect(must(tag.firstElementChild as HTMLElement | null).style.getPropertyValue('--_swatch')).toBe(
      '#0b7285',
    )
    const link = screen.getByRole('link', { name: 'Design' })
    expect(link.querySelector('[data-color="2"]')).not.toBeNull()
  })

  it('keeps a ToggleChip named by its label', () => {
    render(<ToggleChip swatch={1}>Design</ToggleChip>)
    const chip = screen.getByRole('button', { name: 'Design' })
    expect(chip.querySelector('[data-color="1"]')).toHaveAttribute('aria-hidden', 'true')
  })

  it('leaves hosts unchanged without it', () => {
    render(
      <>
        <Badge>Live</Badge>
        <Tag>Docs</Tag>
        <ToggleChip>Mine</ToggleChip>
      </>,
    )
    expect(screen.getByText('Live').children).toHaveLength(0)
    expect(screen.getByText('Docs').children).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Mine' }).querySelector('[data-color]')).toBeNull()
  })
})
