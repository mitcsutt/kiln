import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { Page } from './Page'

describe('Page', () => {
  it('spaces its parts at the page rhythm', () => {
    const { container } = render(
      <Page>
        <Page.Header title="Loading schedule" />
      </Page>,
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.tagName).toBe('DIV')
    expect(root.style.getPropertyValue('--stack-gap-base')).toBe('var(--space-8)')
  })

  it('takes another gap and element', () => {
    const { container } = render(<Page as="article" gap={{ base: 6, md: 8 }} />)
    const root = container.firstElementChild as HTMLElement
    expect(root.tagName).toBe('ARTICLE')
    expect(root.style.getPropertyValue('--stack-gap-md')).toBe('var(--space-8)')
  })

  it('renders the header as the page h1 with its kicker, description, actions and children', () => {
    render(
      <Page.Header
        kicker="Kiln room"
        title="Loading schedule"
        description="Top of the list fires next."
        actions={<button type="button">Book a slot</button>}
      >
        <p>Kiln 2 is down for elements until Friday.</p>
      </Page.Header>,
    )
    const header = screen.getByRole('banner')
    expect(screen.getByRole('heading', { level: 1, name: 'Loading schedule' })).toBeInTheDocument()
    expect(header).toHaveTextContent('Kiln room')
    expect(header).toHaveTextContent('Top of the list fires next.')
    expect(screen.getByRole('button', { name: 'Book a slot' })).toBeInTheDocument()
    expect(header).toHaveTextContent('Kiln 2 is down for elements until Friday.')
  })

  it('names a titled section by its h2', () => {
    render(
      <Page.Section title="Firing queue" description="Top of the list fires next.">
        <p>Saturday class bisque</p>
      </Page.Section>,
    )
    const section = screen.getByRole('region', { name: 'Firing queue' })
    expect(section.tagName).toBe('SECTION')
    expect(screen.getByRole('heading', { level: 2, name: 'Firing queue' })).toBeInTheDocument()
    expect(section.style.getPropertyValue('--stack-gap-base')).toBe('var(--space-4)')
  })

  it('leaves an untitled section unnamed', () => {
    const { container } = render(
      <Page.Section>
        <p>Raku night</p>
      </Page.Section>,
    )
    const section = container.firstElementChild as HTMLElement
    expect(section).not.toHaveAttribute('aria-labelledby')
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('steps columns down to one on a phone', () => {
    const { container } = render(
      <Page.Columns columns={3}>
        <div>Kiln 1</div>
        <div>Kiln 2</div>
        <div>Kiln 3</div>
      </Page.Columns>,
    )
    const grid = container.firstElementChild as HTMLElement
    expect(grid.style.getPropertyValue('--grid-columns-base')).toBe('repeat(1, minmax(0, 1fr))')
    expect(grid.style.getPropertyValue('--grid-columns-md')).toBe('repeat(2, minmax(0, 1fr))')
    expect(grid.style.getPropertyValue('--grid-columns-lg')).toBe('repeat(3, minmax(0, 1fr))')
    expect(grid.style.getPropertyValue('--grid-gap-base')).toBe('var(--space-5)')
  })

  it('forwards refs on every part', () => {
    const page = createRef<HTMLElement>()
    const header = createRef<HTMLElement>()
    const section = createRef<HTMLElement>()
    const columns = createRef<HTMLElement>()
    render(
      <Page ref={page}>
        <Page.Header ref={header} title="Members" />
        <Page.Section ref={section} title="Teachers">
          <Page.Columns ref={columns} />
        </Page.Section>
      </Page>,
    )
    expect(page.current?.tagName).toBe('DIV')
    expect(header.current?.tagName).toBe('HEADER')
    expect(section.current?.tagName).toBe('SECTION')
    expect(columns.current?.tagName).toBe('DIV')
  })
})
