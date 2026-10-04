import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Inline } from '#components/layout/Inline'
import { BottomNav } from '#components/navigation/BottomNav'
import { createIcon, SearchIcon } from '#icons'
import { NavLinks } from './NavLinks'

const meta = {
  title: 'UI/Navigation/NavLinks',
  component: NavLinks,
  args: { label: 'Main', orientation: 'horizontal', size: 'md' },
  render: (args) => (
    <NavLinks {...args}>
      <NavLinks.Item href="#work" active>
        Work
      </NavLinks.Item>
      <NavLinks.Item href="#writing">Writing</NavLinks.Item>
      <NavLinks.Item href="#about">About</NavLinks.Item>
      <NavLinks.Item href="#contact">Contact</NavLinks.Item>
    </NavLinks>
  ),
} satisfies Meta<typeof NavLinks>

export default meta
type Story = StoryObj<typeof meta>

/** A site header. */
export const Playground: Story = {}

/** A league site's desktop top bar. */
export const League: Story = {
  render: () => (
    <NavLinks label="Sunday League">
      <NavLinks.Item href="#fixtures">Fixtures</NavLinks.Item>
      <NavLinks.Item href="#standings" active>
        Table
      </NavLinks.Item>
      <NavLinks.Item href="#squads">Squads</NavLinks.Item>
      <NavLinks.Item href="#results">Results</NavLinks.Item>
    </NavLinks>
  ),
}

/** A sidebar: the current item gets a dot in a reserved gutter. */
export const Vertical: Story = {
  render: () => (
    <NavLinks label="Accounts" orientation="vertical">
      <NavLinks.Item href="#overview">Overview</NavLinks.Item>
      <NavLinks.Item href="#transactions" active>
        Transactions
      </NavLinks.Item>
      <NavLinks.Item href="#categories">Categories</NavLinks.Item>
      <NavLinks.Item href="#recurring">Recurring bills</NavLinks.Item>
      <NavLinks.Item href="#reports">Reports</NavLinks.Item>
    </NavLinks>
  ),
}

/** `size="sm"` with a tighter `gap` for a footer or a sub-nav under a page title. */
export const SmallFooter: Story = {
  render: () => (
    <NavLinks label="Footer" size="sm" gap={4}>
      <NavLinks.Item href="#rss">RSS feed</NavLinks.Item>
      <NavLinks.Item href="#github">GitHub</NavLinks.Item>
      <NavLinks.Item href="#colophon">Colophon</NavLinks.Item>
      <NavLinks.Item href="#privacy">Privacy</NavLinks.Item>
    </NavLinks>
  ),
}

const TrophyIcon = createIcon(
  'TrophyIcon',
  <path d="M6.5 3.5h7v4a3.5 3.5 0 0 1-7 0zM6.5 5h-3c0 2.2 1.3 3.5 3.2 3.7M13.5 5h3c0 2.2-1.3 3.5-3.2 3.7M10 11v3M7 16.5h6" />,
)
const CalendarIcon = createIcon(
  'CalendarIcon',
  <>
    <rect x="3.5" y="4.5" width="13" height="12" rx="1.5" />
    <path d="M3.5 8.5h13M7 3v3M13 3v3" />
  </>,
)
const BracketIcon = createIcon(
  'BracketIcon',
  <path d="M3.5 4.5h4v4h-4M3.5 11.5h4v4h-4M7.5 6.5h3v7h-3M10.5 10h6" />,
)

/**
 * One nav, two shapes. The header links use `hideBelow="md"`; the tab bar uses
 * `hideAbove="md"` — the same breakpoint, so exactly one is on screen at any width.
 * Resize the frame across 768px to see them swap. "Squads" is also hidden on the
 * header below `lg` with `NavLinks.Item hideBelow="lg"`, to make room at tablet widths.
 */
export const PairedWithBottomNav: Story = {
  render: () => (
    <Stack gap={8}>
      <Inline justify="between" gap={5}>
        <strong>Sunday League</strong>
        <NavLinks label="Main" hideBelow="md">
          <NavLinks.Item href="#league" active>
            League
          </NavLinks.Item>
          <NavLinks.Item href="#fixtures">Fixtures</NavLinks.Item>
          <NavLinks.Item href="#squads" hideBelow="lg">
            Squads
          </NavLinks.Item>
          <NavLinks.Item href="#bracket">Bracket</NavLinks.Item>
        </NavLinks>
      </Inline>
      <BottomNav label="Main" position="static" hideAbove="md">
        <BottomNav.Item href="#league" icon={<TrophyIcon />} label="League" active />
        <BottomNav.Item href="#fixtures" icon={<CalendarIcon />} label="Fixtures" badge={2} />
        <BottomNav.Item href="#search" icon={<SearchIcon />} label="Search" />
        <BottomNav.Item href="#bracket" icon={<BracketIcon />} label="Bracket" />
      </BottomNav>
    </Stack>
  ),
}
