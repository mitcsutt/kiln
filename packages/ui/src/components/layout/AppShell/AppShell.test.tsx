import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppShell } from './AppShell'

function Frame(props: { mainId?: string; sticky?: boolean }) {
  return (
    <AppShell mainId={props.mainId}>
      <AppShell.Header sticky={props.sticky}>Workspace</AppShell.Header>
      <AppShell.Sidebar aria-label="Sections" side="end">
        Projects
      </AppShell.Sidebar>
      <AppShell.Main>Open tasks</AppShell.Main>
      <AppShell.Footer>Release 2.4</AppShell.Footer>
      <AppShell.BottomBar>Tabs</AppShell.BottomBar>
    </AppShell>
  )
}

describe('AppShell', () => {
  it('renders the landmarks', () => {
    render(<Frame />)
    expect(screen.getByRole('banner')).toHaveTextContent('Workspace')
    expect(screen.getByRole('main')).toHaveTextContent('Open tasks')
    expect(screen.getByRole('complementary', { name: 'Sections' })).toHaveAttribute(
      'data-side',
      'end',
    )
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('renders a skip link as the first tab stop, targeting Main', async () => {
    render(<Frame />)
    await userEvent.tab()
    const skip = screen.getByRole('link', { name: 'Skip to content' })
    expect(skip).toHaveFocus()
    const main = screen.getByRole('main')
    expect(main.id).not.toBe('')
    expect(skip).toHaveAttribute('href', `#${main.id}`)
    expect(main).toHaveAttribute('tabindex', '-1')
  })

  it('uses a provided main id', () => {
    render(<Frame mainId="content" />)
    expect(screen.getByRole('main')).toHaveAttribute('id', 'content')
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute(
      'href',
      '#content',
    )
  })

  it('makes the header sticky by default and lets it opt out', () => {
    const { rerender } = render(<Frame />)
    expect(screen.getByRole('banner')).toHaveAttribute('data-sticky')
    rerender(<Frame sticky={false} />)
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-sticky')
  })

  it('hands nav over at lg by default, or at md when asked', () => {
    const { container, rerender } = render(<Frame />)
    expect(container.firstElementChild).toHaveAttribute('data-nav-breakpoint', 'lg')
    rerender(
      <AppShell navBreakpoint="md">
        <AppShell.Main>Open tasks</AppShell.Main>
      </AppShell>,
    )
    expect(container.firstElementChild).toHaveAttribute('data-nav-breakpoint', 'md')
  })
})
