import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ArrowRightIcon,
  BottomNav,
  CalendarIcon,
  CircleCheckIcon,
  MessageIcon,
  SearchIcon,
  StarIcon,
  UsersIcon,
} from '@mitcsutt/kiln-ui'
import { createIcon } from '#icons'

/* Story-only glyph on the library's 20px grid; the rest ship with Kiln. */
const TableIcon = createIcon('TableIcon', <path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13M7.5 5.5v9" />)

const meta = {
  title: 'UI/Navigation/BottomNav',
  component: BottomNav,
  parameters: { layout: 'fullscreen' },
  args: { label: 'Workspace', hideAbove: false, position: 'static' },
  render: (args) => (
    <BottomNav {...args}>
      <BottomNav.Item href="#calendar" icon={<CalendarIcon />} label="Calendar" />
      <BottomNav.Item href="#projects" icon={<TableIcon />} label="Projects" active />
      <BottomNav.Item href="#team" icon={<UsersIcon />} label="Team" />
      <BottomNav.Item href="#feed" icon={<MessageIcon />} label="Feed" badge={4} />
    </BottomNav>
  ),
} satisfies Meta<typeof BottomNav>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Shown in flow (`position="static"`, `hideAbove={false}`) so it renders in the frame;
 * in an app leave the defaults — fixed to the viewport, hidden from `md` up.
 */
export const Playground: Story = {}

export const Badges: Story = {
  render: (args) => (
    <BottomNav {...args}>
      <BottomNav.Item href="#calendar" icon={<CalendarIcon />} label="Calendar" active />
      <BottomNav.Item href="#search" icon={<SearchIcon />} label="Search" />
      <BottomNav.Item href="#team" icon={<UsersIcon />} label="Team" badge />
      <BottomNav.Item href="#feed" icon={<MessageIcon />} label="Feed" badge={128} />
    </BottomNav>
  ),
}

/** Three destinations is the minimum worth a tab bar. */
export const ThreeItems: Story = {
  args: { label: 'Billing' },
  render: (args) => (
    <BottomNav {...args}>
      <BottomNav.Item href="#overview" icon={<TableIcon />} label="Overview" active />
      <BottomNav.Item href="#invoices" icon={<CalendarIcon />} label="Invoices" badge={2} />
      <BottomNav.Item href="#search" icon={<SearchIcon />} label="Search" />
    </BottomNav>
  ),
}

/**
 * Three to five items, each with an `icon` and a short `label`. `badge` adds a dot (`true`) or a
 * count. Here it's shown in the flow (`position="static"`, `hideAbove={false}`) so it appears in
 * the preview; in an app, leave the defaults, or put it in `AppShell.BottomBar`, which handles the
 * placement.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <BottomNav position="static" hideAbove={false} label="Main">
        <BottomNav.Item href="#departures" icon={<ArrowRightIcon />} label="Departures" active />
        <BottomNav.Item href="#search" icon={<SearchIcon />} label="Search" />
        <BottomNav.Item href="#saved" icon={<StarIcon />} label="Saved" badge={2} />
        <BottomNav.Item href="#tickets" icon={<CircleCheckIcon />} label="Tickets" badge />
      </BottomNav>
    )
  },
}
