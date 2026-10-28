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

  it('takes another gap', () => {
    const { container } = render(<Page gap={{ base: 6, md: 8 }} />)
    const root = container.firstElementChild as HTMLElement
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

  it('forwards refs on every part', () => {
    const page = createRef<HTMLElement>()
    const header = createRef<HTMLElement>()
    const section = createRef<HTMLElement>()
    render(
      <Page ref={page}>
        <Page.Header ref={header} title="Members" />
        <Page.Section ref={section} title="Teachers" />
      </Page>,
    )
    expect(page.current?.tagName).toBe('DIV')
    expect(header.current?.tagName).toBe('HEADER')
    expect(section.current?.tagName).toBe('SECTION')
  })
})
