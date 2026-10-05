import { render, screen } from '@testing-library/react'
import { Grid } from './Grid'

describe('Grid', () => {
  it('maps responsive columns to track lists', () => {
    const { container } = render(<Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={5} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.getPropertyValue('--grid-columns-base')).toBe('repeat(1, minmax(0, 1fr))')
    expect(el.style.getPropertyValue('--grid-columns-md')).toBe('repeat(2, minmax(0, 1fr))')
    expect(el.style.getPropertyValue('--grid-columns-lg')).toBe('repeat(4, minmax(0, 1fr))')
    expect(el.style.getPropertyValue('--grid-gap-xl')).toBe('var(--space-5)')
  })

  it('switches to intrinsic auto-fill with minItemWidth', () => {
    const { container } = render(<Grid minItemWidth="md" rowGap={{ base: 3, md: 6 }} />)
    const el = container.firstElementChild as HTMLElement
    expect(el).toHaveAttribute('data-min-item', 'md')
    expect(el.style.getPropertyValue('--grid-columns-base')).toBe('')
    expect(el.style.getPropertyValue('--grid-row-gap-sm')).toBe('var(--space-3)')
    expect(el.style.getPropertyValue('--grid-row-gap-md')).toBe('var(--space-6)')
  })

  it('keeps list semantics when rendered as a list', () => {
    render(
      <Grid as="ul" columns={3}>
        <Grid.Item as="li">Atlas redesign</Grid.Item>
      </Grid>,
    )
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByRole('listitem')).toHaveTextContent('Atlas redesign')
  })

  describe('Grid.Item', () => {
    it('maps span and start per breakpoint', () => {
      render(
        <Grid.Item data-testid="item" span={{ base: 'full', md: 8 }} start={{ md: 3 }}>
          Open tasks
        </Grid.Item>,
      )
      const el = screen.getByTestId('item')
      expect(el.style.getPropertyValue('--grid-item-end-base')).toBe('-1')
      expect(el.style.getPropertyValue('--grid-item-full-base')).toBe('1')
      expect(el.style.getPropertyValue('--grid-item-end-md')).toBe('span 8')
      expect(el.style.getPropertyValue('--grid-item-full-md')).toBe('auto')
      expect(el.style.getPropertyValue('--grid-item-start-base')).toBe('')
      expect(el.style.getPropertyValue('--grid-item-start-md')).toBe('3')
    })
  })
})
