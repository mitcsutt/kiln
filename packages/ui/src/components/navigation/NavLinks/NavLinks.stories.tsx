import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Badge,
  CalendarIcon as KilnCalendarIcon,
  NavLinks,
  NavLinksGroup,
  Stack,
  UsersIcon,
  createIcon as createKilnIcon,
} from '@mitcsutt/kiln-ui'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { fontSize, resolvedSize } from '#components/_story/fontSize'
import { storyRoot } from '#components/_story/storyRoot'
import { Inline } from '#components/layout/Inline'
import { BottomNav } from '#components/navigation/BottomNav'
import { createIcon, SearchIcon } from '#icons'

const meta = {
  title: 'UI/Navigation/NavLinks',
  component: NavLinks,
  args: { label: 'Main', orientation: 'horizontal', size: 'md' },
  render: (args) => (
    <NavLinks {...args}>
      <NavLinks.Item href="#product" active>
        Product
      </NavLinks.Item>
      <NavLinks.Item href="#pricing">Pricing</NavLinks.Item>
      <NavLinks.Item href="#customers">Customers</NavLinks.Item>
      <NavLinks.Item href="#contact">Contact</NavLinks.Item>
    </NavLinks>
  ),
} satisfies Meta<typeof NavLinks>

export default meta
type Story = StoryObj<typeof meta>

/** A site header. */
export const Playground: Story = {}

/** A workspace app's desktop top bar. */
export const Workspace: Story = {
  render: () => (
    <NavLinks label="Workspace">
      <NavLinks.Item href="#calendar">Calendar</NavLinks.Item>
      <NavLinks.Item href="#projects" active>
        Projects
      </NavLinks.Item>
      <NavLinks.Item href="#team">Team</NavLinks.Item>
      <NavLinks.Item href="#reports">Reports</NavLinks.Item>
    </NavLinks>
  ),
}

/** A sidebar: the current item gets a dot in a reserved gutter. */
export const Vertical: Story = {
  render: () => (
    <NavLinks label="Billing" orientation="vertical">
      <NavLinks.Item href="#overview">Overview</NavLinks.Item>
      <NavLinks.Item href="#invoices" active>
        Invoices
      </NavLinks.Item>
      <NavLinks.Item href="#clients">Clients</NavLinks.Item>
      <NavLinks.Item href="#recurring">Recurring invoices</NavLinks.Item>
      <NavLinks.Item href="#reports">Reports</NavLinks.Item>
    </NavLinks>
  ),
}

/** `size="sm"` with a tighter `gap` for a footer or a sub-nav under a page title. */
export const SmallFooter: Story = {
  render: () => (
    <NavLinks label="Footer" size="sm" gap={4}>
      <NavLinks.Item href="#status">Status</NavLinks.Item>
      <NavLinks.Item href="#changelog">Changelog</NavLinks.Item>
      <NavLinks.Item href="#terms">Terms</NavLinks.Item>
      <NavLinks.Item href="#privacy">Privacy</NavLinks.Item>
    </NavLinks>
  ),
}

const FolderIcon = createIcon(
  'FolderIcon',
  <path d="M3.5 5.5a1 1 0 0 1 1-1H8l1.5 2h6a1 1 0 0 1 1 1v7.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z" />,
)
const CalendarIcon = createIcon(
  'CalendarIcon',
  <>
    <rect x="3.5" y="4.5" width="13" height="12" rx="1.5" />
    <path d="M3.5 8.5h13M7 3v3M13 3v3" />
  </>,
)
const RoadmapIcon = createIcon('RoadmapIcon', <path d="M3.5 5.5h7M6.5 10h8M9.5 14.5h7" />)

/**
 * One nav, two shapes. The header links use `hideBelow="md"`; the tab bar uses
 * `hideAbove="md"` — the same breakpoint, so exactly one is on screen at any width.
 * Resize the frame across 768px to see them swap. "Team" is also hidden on the
 * header below `lg` with `NavLinks.Item hideBelow="lg"`, to make room at tablet widths.
 */
export const PairedWithBottomNav: Story = {
  render: () => (
    <Stack gap={8}>
      <Inline justify="between" gap={5}>
        <strong>Northwind Studio</strong>
        <NavLinks label="Main" hideBelow="md">
          <NavLinks.Item href="#projects" active>
            Projects
          </NavLinks.Item>
          <NavLinks.Item href="#calendar">Calendar</NavLinks.Item>
          <NavLinks.Item href="#team" hideBelow="lg">
            Team
          </NavLinks.Item>
          <NavLinks.Item href="#roadmap">Roadmap</NavLinks.Item>
        </NavLinks>
      </Inline>
      <BottomNav label="Main" position="static" hideAbove="md">
        <BottomNav.Item href="#projects" icon={<FolderIcon />} label="Projects" active />
        <BottomNav.Item href="#calendar" icon={<CalendarIcon />} label="Calendar" badge={2} />
        <BottomNav.Item href="#search" icon={<SearchIcon />} label="Search" />
        <BottomNav.Item href="#roadmap" icon={<RoadmapIcon />} label="Roadmap" />
      </BottomNav>
    </Stack>
  ),
}

const LINKS = ['Departures', 'Routes', 'Fares', 'Accessibility']

/**
 * Every `<nav>` on a page needs its own name, so give each `NavLinks` a `label`. Pass `active` to
 * the current item. For your router's links, use `asChild`:
 *
 * ```tsx
 * <NavLinks.Item asChild active={pathname === '/routes'}>
 *   <NextLink href="/routes">Routes</NextLink>
 * </NavLinks.Item>
 * ```
 *
 * `hideBelow` hides the whole nav on small screens, so it can hand over to a
 * [BottomNav](/docs/ui/navigation/bottom-nav): `<NavLinks hideBelow="md">` beside `<BottomNav
 * hideAbove="md">`.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={6}>
        <NavLinks label="Main">
          {LINKS.map((link, index) => (
            <NavLinks.Item key={link} href={`#${link.toLowerCase()}`} active={index === 1}>
              {link}
            </NavLinks.Item>
          ))}
        </NavLinks>
        <NavLinks label="Account" orientation="vertical" size="sm">
          <NavLinks.Item href="#profile" active>
            Profile
          </NavLinks.Item>
          <NavLinks.Item href="#passes">Passes</NavLinks.Item>
          <NavLinks.Item href="#history">Trip history</NavLinks.Item>
        </NavLinks>
      </Stack>
    )
  },
  play: async ({ canvasElement }) => {
    // Navigation text stays off the caption steps (DESIGN.md §2 Type).
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    const md = canvas.getByRole('link', { name: 'Routes' })
    const sm = canvas.getByRole('link', { name: 'Passes' })
    await expect(fontSize(md)).toBe(resolvedSize(md, 'var(--text-md)'))
    await expect(fontSize(sm)).toBe(resolvedSize(sm, 'var(--text-sm)'))
    await expect(fontSize(sm)).toBeGreaterThan(resolvedSize(sm, 'var(--text-xs)'))
  },
}

const LedgerIcon = createKilnIcon(
  'LedgerIcon',
  <>
    <rect x="4.5" y="3.5" width="11" height="13" rx="1" />
    <path d="M7.5 7.5h5M7.5 10.5h5M7.5 13.5h3" />
  </>,
)
const GearIcon = createKilnIcon(
  'GearIcon',
  <>
    <circle cx="10" cy="10" r="2.5" />
    <path d="M10 3.5v2M10 14.5v2M3.5 10h2M14.5 10h2M5.4 5.4l1.4 1.4M13.2 13.2l1.4 1.4M5.4 14.6l1.4-1.4M13.2 6.8l1.4-1.4" />
  </>,
)

/**
 * `NavLinksGroup`, imported beside `NavLinks`, nests links under a section, and groups nest inside
 * groups. Each level is indented on a guide rule, and labels stay at body size at every depth. The
 * group holding the current page opens by itself; close it and a ring shows where the current page
 * is. Items and groups take an `icon` and a `trailing` count.
 */
export const Groups: Story = {
  tags: ['docs'],
  render: () => (
    <NavLinks label="Workspace" orientation="vertical" size="sm">
      <NavLinks.Item href="#calendar" icon={<KilnCalendarIcon />}>
        Calendar
      </NavLinks.Item>
      <NavLinksGroup label="Ledgers" icon={<LedgerIcon />} trailing={<Badge>3</Badge>}>
        <NavLinks.Item href="#granton">Granton yard</NavLinks.Item>
        <NavLinks.Item href="#leith" active>
          Leith yard
        </NavLinks.Item>
        <NavLinks.Item href="#newhaven">Newhaven yard</NavLinks.Item>
      </NavLinksGroup>
      <NavLinks.Item href="#people" icon={<UsersIcon />}>
        People
      </NavLinks.Item>
      <NavLinksGroup label="Settings" icon={<GearIcon />}>
        <NavLinks.Item href="#profile">Profile</NavLinks.Item>
        <NavLinks.Item href="#billing">Billing</NavLinks.Item>
        <NavLinksGroup label="Integrations">
          <NavLinks.Item href="#bank-feeds">Bank feeds</NavLinks.Item>
          <NavLinks.Item href="#payroll">Payroll export</NavLinks.Item>
        </NavLinksGroup>
      </NavLinksGroup>
    </NavLinks>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    const ledgers = canvas.getByRole('button', { name: 'Ledgers 3' })
    await expect(ledgers).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('link', { name: 'Leith yard' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    // Keyboard: Down to Settings, Right opens it, Right again steps in, Left steps back out.
    canvas.getByRole('link', { name: 'People' }).focus()
    await userEvent.keyboard('{ArrowDown}')
    const settings = canvas.getByRole('button', { name: 'Settings' })
    await expect(settings).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(settings).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(canvas.getByRole('link', { name: 'Profile' })).toHaveFocus())
    await userEvent.keyboard('{ArrowLeft}')
    await expect(settings).toHaveFocus()
    // Nested labels stay at the same size as the top level.
    await expect(fontSize(canvas.getByRole('link', { name: 'Profile' }))).toBe(
      fontSize(canvas.getByRole('link', { name: 'People' })),
    )
  },
}

/**
 * A section with a landing page of its own: give the group `href`, or a router `link` such as
 * `link={<Link to="/reports" />}`. The label becomes a link, with its own button to open and close
 * the group.
 */
export const LinkedGroup: Story = {
  tags: ['docs'],
  render: () => (
    <NavLinks label="Reports" orientation="vertical">
      <NavLinks.Item href="#overview">Overview</NavLinks.Item>
      <NavLinksGroup label="Reports" href="#reports" defaultOpen>
        <NavLinks.Item href="#aged-debt">Aged debt</NavLinks.Item>
        <NavLinks.Item href="#vat">VAT returns</NavLinks.Item>
      </NavLinksGroup>
    </NavLinks>
  ),
}

/**
 * In a horizontal nav, a group opens its links in a panel under the button, so a top bar gets one
 * level of nesting. Following a link closes the panel.
 */
export const TopBarGroups: Story = {
  tags: ['docs'],
  render: () => (
    <NavLinks label="Main">
      <NavLinks.Item href="#home">Home</NavLinks.Item>
      <NavLinksGroup label="Products">
        <NavLinks.Item href="#ledgers">Ledgers</NavLinks.Item>
        <NavLinks.Item href="#payroll" active>
          Payroll
        </NavLinks.Item>
        <NavLinks.Item href="#expenses">Expenses</NavLinks.Item>
      </NavLinksGroup>
      <NavLinks.Item href="#pricing">Pricing</NavLinks.Item>
    </NavLinks>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    const page = within(canvasElement.ownerDocument.body)
    const products = canvas.getByRole('button', { name: 'Products' })
    await userEvent.click(products)
    const panel = await page.findByRole('dialog', { name: 'Products' })
    await expect(within(panel).getByRole('link', { name: 'Payroll' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(products).toHaveAttribute('aria-expanded', 'false'))
  },
}
