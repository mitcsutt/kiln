import type { Meta, StoryObj } from '@storybook/react-vite'
import { NavLinks, Stack } from '@mitcsutt/kiln-ui'
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
}
