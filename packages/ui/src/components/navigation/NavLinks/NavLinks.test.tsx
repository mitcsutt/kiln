import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, forwardRef, type AnchorHTMLAttributes } from 'react'
import { NavLinks } from './NavLinks'
import { NavLinksGroup } from './NavLinksGroup'

// Stand-in for a router <Link>.
const RouterLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(function RouterLink({ to, children, ...rest }, ref) {
  return (
    <a ref={ref} href={to} data-router="" {...rest}>
      {children}
    </a>
  )
})

describe('NavLinks', () => {
  it('renders a labelled nav landmark with a list of links', () => {
    render(
      <NavLinks label="Primary">
        <NavLinks.Item href="/work">Work</NavLinks.Item>
        <NavLinks.Item href="/writing">Writing</NavLinks.Item>
      </NavLinks>,
    )
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(nav).toHaveAttribute('data-orientation', 'horizontal')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('marks only the active item with aria-current="page"', () => {
    render(
      <NavLinks>
        <NavLinks.Item href="/work" active>
          Work
        </NavLinks.Item>
        <NavLinks.Item href="/about">About</NavLinks.Item>
      </NavLinks>,
    )
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current')
  })

  it('supports router links via asChild and forwards refs', () => {
    const ref = createRef<HTMLAnchorElement>()
    render(
      <NavLinks orientation="vertical">
        <NavLinks.Item asChild active ref={ref}>
          <RouterLink to="/reports">Reports</RouterLink>
        </NavLinks.Item>
      </NavLinks>,
    )
    const link = screen.getByRole('link', { name: 'Reports' })
    expect(ref.current).toBe(link)
    expect(link).toHaveAttribute('data-router')
    expect(link).toHaveAttribute('href', '/reports')
    expect(link).toHaveAttribute('aria-current', 'page')
    expect(link).toHaveAttribute('data-orientation', 'vertical')
  })

  it('applies gap, size and visibility', () => {
    render(
      <NavLinks label="Footer" gap={3} size="sm" hideBelow="md">
        <NavLinks.Item href="/rss" hideAbove="lg">
          RSS
        </NavLinks.Item>
      </NavLinks>,
    )
    const nav = screen.getByRole('navigation', { name: 'Footer' })
    expect(nav).toHaveAttribute('data-size', 'sm')
    expect(nav).toHaveClass('hideBelowMd')
    expect(screen.getByRole('list').style.getPropertyValue('--_gap')).toBe('var(--space-3)')
    expect(screen.getByRole('link', { name: 'RSS' })).toHaveAttribute('data-size', 'sm')
    expect(screen.getByRole('listitem')).toHaveClass('hideAboveLg')
  })

  it('leaves the gap to CSS when not set', () => {
    render(
      <NavLinks>
        <NavLinks.Item href="/">Home</NavLinks.Item>
      </NavLinks>,
    )
    expect(screen.getByRole('list')).not.toHaveAttribute('style')
  })
})

function Sidebar(props: { settingsOpen?: boolean; onSettingsChange?: (open: boolean) => void }) {
  return (
    <NavLinks label="Workspace" orientation="vertical">
      <NavLinks.Item href="/">Home</NavLinks.Item>
      <NavLinksGroup
        label="Settings"
        open={props.settingsOpen}
        onOpenChange={props.onSettingsChange}
      >
        <NavLinks.Item href="/settings/profile">Profile</NavLinks.Item>
        <NavLinks.Item href="/settings/billing">Billing</NavLinks.Item>
        <NavLinksGroup label="Integrations">
          <NavLinks.Item href="/settings/integrations/git">Git</NavLinks.Item>
        </NavLinksGroup>
      </NavLinksGroup>
      <NavLinks.Item href="/help">Help</NavLinks.Item>
    </NavLinks>
  )
}

describe('NavLinks, flat', () => {
  it('renders no group markup and keeps each item a plain list item', () => {
    const { container } = render(
      <NavLinks orientation="vertical">
        <NavLinks.Item href="/work" active>
          Work
        </NavLinks.Item>
      </NavLinks>,
    )
    expect(container.querySelector('button')).not.toBeInTheDocument()
    expect(container.querySelector('[data-navlinks-group]')).not.toBeInTheDocument()
    const item = screen.getByRole('listitem')
    expect([...item.attributes].map((attribute) => attribute.name)).toEqual(['class'])
    expect(screen.getByRole('link').innerHTML).toBe('Work')
  })

  it('leaves arrow keys alone', async () => {
    render(
      <NavLinks orientation="vertical">
        <NavLinks.Item href="/a">Alpha</NavLinks.Item>
        <NavLinks.Item href="/b">Beta</NavLinks.Item>
      </NavLinks>,
    )
    screen.getByRole('link', { name: 'Alpha' }).focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('link', { name: 'Alpha' })).toHaveFocus()
  })
})

describe('NavLinksGroup', () => {
  it('is a disclosure button over a nested list', async () => {
    render(<Sidebar />)
    const settings = screen.getByRole('button', { name: 'Settings' })
    expect(settings).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'Billing' })).not.toBeInTheDocument()
    await userEvent.click(settings)
    expect(settings).toHaveAttribute('aria-expanded', 'true')
    const panel = document.getElementById(String(settings.getAttribute('aria-controls')))
    expect(panel).toContainElement(screen.getByRole('link', { name: 'Billing' }))
    expect(screen.getByRole('button', { name: 'Integrations' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('opens a group that holds the current page and marks it, keeping aria-current on the leaf', () => {
    render(
      <NavLinks orientation="vertical">
        <NavLinksGroup label="Reports" icon={<svg />} trailing="4">
          <NavLinks.Item href="/reports/aged">Aged debt</NavLinks.Item>
          <NavLinks.Item href="/reports/vat" active>
            VAT returns
          </NavLinks.Item>
        </NavLinksGroup>
        <NavLinksGroup label="Archive">
          <NavLinks.Item href="/archive/2023">2023</NavLinks.Item>
        </NavLinksGroup>
      </NavLinks>,
    )
    const reports = screen.getByRole('button', { name: 'Reports 4' })
    expect(reports).toHaveAttribute('aria-expanded', 'true')
    expect(reports).toHaveAttribute('data-contains-active')
    expect(screen.getByRole('link', { name: 'VAT returns' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('button', { name: 'Archive' })).not.toHaveAttribute(
      'data-contains-active',
    )
  })

  it('opens when the current page moves into it, and reports through items in your own components', () => {
    function MyLink({ to, current }: { to: string; current: boolean }) {
      return (
        <NavLinks.Item href={to} active={current}>
          Ledger
        </NavLinks.Item>
      )
    }
    const view = (current: boolean) => (
      <NavLinks orientation="vertical">
        <NavLinksGroup label="Books">
          <MyLink to="/books/ledger" current={current} />
        </NavLinksGroup>
      </NavLinks>
    )
    const { rerender } = render(view(false))
    expect(screen.getByRole('button', { name: 'Books' })).toHaveAttribute('aria-expanded', 'false')
    rerender(view(true))
    expect(screen.getByRole('button', { name: 'Books' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('marks a closed horizontal group that holds a current page in your own component', () => {
    function MyLink({ to, current }: { to: string; current: boolean }) {
      return (
        <NavLinks.Item href={to} active={current}>
          VAT returns
        </NavLinks.Item>
      )
    }
    render(
      <NavLinks label="Main">
        <NavLinksGroup label="Reports">
          <NavLinks.Item href="/reports/aged">Aged debt</NavLinks.Item>
          <MyLink to="/reports/vat" current />
        </NavLinksGroup>
      </NavLinks>,
    )
    const reports = screen.getByRole('button', { name: 'Reports' })
    expect(reports).toHaveAttribute('aria-expanded', 'false')
    expect(reports).toHaveAttribute('data-contains-active')
    expect(screen.queryByRole('link', { name: 'VAT returns' })).not.toBeInTheDocument()
  })

  it('supports controlled state', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<Sidebar settingsOpen={false} onSettingsChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    rerender(<Sidebar settingsOpen onSettingsChange={onChange} />)
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('can be a link to its own page, with a separate toggle', async () => {
    render(
      <NavLinks orientation="vertical">
        <NavLinksGroup label="Settings" link={<RouterLink to="/settings" />} active>
          <NavLinks.Item href="/settings/profile">Profile</NavLinks.Item>
        </NavLinksGroup>
      </NavLinks>,
    )
    const link = screen.getByRole('link', { name: 'Settings' })
    expect(link).toHaveAttribute('href', '/settings')
    expect(link).toHaveAttribute('data-router')
    expect(link).toHaveAttribute('aria-current', 'page')
    const toggle = screen.getByRole('button', { name: 'Settings' })
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument()
  })

  it('moves through visible items like a tree', async () => {
    render(<Sidebar />)
    screen.getByRole('link', { name: 'Home' }).focus()
    await userEvent.keyboard('{ArrowDown}')
    const settings = screen.getByRole('button', { name: 'Settings' })
    expect(settings).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('link', { name: 'Help' })).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}{ArrowRight}')
    expect(settings).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(settings).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(settings).toHaveAttribute('aria-expanded', 'false')
    await userEvent.keyboard('{End}')
    expect(screen.getByRole('link', { name: 'Help' })).toHaveFocus()
    await userEvent.keyboard('{Home}')
    expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus()
    await userEvent.keyboard('s')
    expect(settings).toHaveFocus()
  })

  it('skips items hidden at this breakpoint', async () => {
    HTMLElement.prototype.checkVisibility = function (this: HTMLElement) {
      return !this.closest('.hideBelowMd')
    }
    render(
      <NavLinks label="Workspace" orientation="vertical">
        <NavLinks.Item href="/">Home</NavLinks.Item>
        <NavLinksGroup label="Settings">
          <NavLinks.Item href="/settings/profile">Profile</NavLinks.Item>
        </NavLinksGroup>
        <NavLinks.Item href="/archive" hideBelow="md">
          Archive
        </NavLinks.Item>
        <NavLinks.Item href="/help">Help</NavLinks.Item>
      </NavLinks>,
    )
    const settings = screen.getByRole('button', { name: 'Settings' })
    settings.focus()
    await userEvent.keyboard('{ArrowDown}')
    const help = screen.getByRole('link', { name: 'Help' })
    expect(help).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    expect(settings).toHaveFocus()
    await userEvent.keyboard('a')
    expect(settings).toHaveFocus()
    Reflect.deleteProperty(HTMLElement.prototype, 'checkVisibility')
  })

  it('opens a panel in a horizontal nav, and closes it when a link is followed', async () => {
    render(
      <NavLinks label="Main">
        <NavLinks.Item href="/">Home</NavLinks.Item>
        <NavLinksGroup label="Products">
          <NavLinks.Item href="#ledgers">Ledgers</NavLinks.Item>
          <NavLinks.Item href="#payroll">Payroll</NavLinks.Item>
        </NavLinksGroup>
      </NavLinks>,
    )
    const products = screen.getByRole('button', { name: 'Products' })
    await userEvent.click(products)
    expect(products).toHaveAttribute('aria-expanded', 'true')
    const panel = screen.getByRole('dialog', { name: 'Products' })
    const payroll = within(panel).getByRole('link', { name: 'Payroll' })
    expect(payroll).toHaveAttribute('data-orientation', 'vertical')
    await userEvent.click(payroll)
    expect(products).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows icons and trailing counts on items without changing their name', () => {
    render(
      <NavLinks orientation="vertical">
        <NavLinks.Item href="/inbox" icon={<svg data-testid="glyph" />} trailing="12">
          Inbox
        </NavLinks.Item>
        <NavLinks.Item asChild icon={<svg />}>
          <RouterLink to="/sent">Sent</RouterLink>
        </NavLinks.Item>
      </NavLinks>,
    )
    expect(screen.getByRole('link', { name: 'Inbox 12' })).toContainElement(
      screen.getByTestId('glyph'),
    )
    const sent = screen.getByRole('link', { name: 'Sent' })
    expect(sent).toHaveAttribute('data-router')
    expect(sent.querySelector('svg')).toBeInTheDocument()
  })
})
