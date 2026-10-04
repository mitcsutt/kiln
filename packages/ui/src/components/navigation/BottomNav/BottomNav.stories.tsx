import type { Meta, StoryObj } from '@storybook/react-vite'
import { createIcon, SearchIcon } from '#icons'
import { BottomNav } from './BottomNav'

/* Story-only glyphs on the library's 20px grid — apps bring their own set. */
const CalendarIcon = createIcon(
  'CalendarIcon',
  <>
    <rect x="3.5" y="4.5" width="13" height="12" rx="1.5" />
    <path d="M3.5 8.5h13M7 3v3M13 3v3" />
  </>,
)
const TableIcon = createIcon('TableIcon', <path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13M7.5 5.5v9" />)
const PeopleIcon = createIcon(
  'PeopleIcon',
  <>
    <circle cx="8" cy="7" r="2.75" />
    <path d="M3 16c.6-2.6 2.6-4 5-4s4.4 1.4 5 4M13 4.6a2.6 2.6 0 0 1 0 4.8M15 12.2c1 .6 1.7 1.8 2 3.3" />
  </>,
)
const FeedIcon = createIcon('FeedIcon', <path d="M4 4.5h12v8.5H9l-3.5 3v-3H4z" />)

const meta = {
  title: 'UI/Navigation/BottomNav',
  component: BottomNav,
  parameters: { layout: 'fullscreen' },
  args: { label: 'Sunday League', hideAbove: false, position: 'static' },
  render: (args) => (
    <BottomNav {...args}>
      <BottomNav.Item href="#fixtures" icon={<CalendarIcon />} label="Fixtures" />
      <BottomNav.Item href="#table" icon={<TableIcon />} label="Table" active />
      <BottomNav.Item href="#squads" icon={<PeopleIcon />} label="Squads" />
      <BottomNav.Item href="#feed" icon={<FeedIcon />} label="Feed" badge={4} />
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
      <BottomNav.Item href="#fixtures" icon={<CalendarIcon />} label="Fixtures" active />
      <BottomNav.Item href="#search" icon={<SearchIcon />} label="Search" />
      <BottomNav.Item href="#squads" icon={<PeopleIcon />} label="Squads" badge />
      <BottomNav.Item href="#feed" icon={<FeedIcon />} label="Feed" badge={128} />
    </BottomNav>
  ),
}

/** Three destinations is the minimum worth a tab bar. */
export const ThreeItems: Story = {
  args: { label: 'Accounts' },
  render: (args) => (
    <BottomNav {...args}>
      <BottomNav.Item href="#overview" icon={<TableIcon />} label="Overview" active />
      <BottomNav.Item href="#bills" icon={<CalendarIcon />} label="Bills" badge={2} />
      <BottomNav.Item href="#search" icon={<SearchIcon />} label="Search" />
    </BottomNav>
  ),
}
