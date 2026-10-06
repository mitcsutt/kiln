import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, Text } from '@mitcsutt/kiln-ui'
import { expect, userEvent, within } from 'storybook/test'
import { fontSize, resolvedSize } from '#components/_story/fontSize'
import { storyRoot } from '#components/_story/storyRoot'
import { Stack } from '#components/layout/Stack'

const meta = {
  title: 'UI/Navigation/Tabs',
  component: Tabs,
  args: { defaultValue: 'tasks', variant: 'underline' },
  render: (args) => (
    <Tabs {...args}>
      <Tabs.List aria-label="Atlas redesign">
        <Tabs.Trigger value="tasks">Tasks</Tabs.Trigger>
        <Tabs.Trigger value="people">People</Tabs.Trigger>
        <Tabs.Trigger value="history">History</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tasks">14 open tasks · 3 in review · Due 28 November</Tabs.Content>
      <Tabs.Content value="people">Priya Nair — design lead, 6 open tasks</Tabs.Content>
      <Tabs.Content value="history">
        Started in March, rescoped in June, beta in September.
      </Tabs.Content>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

/** Arrow keys move between tabs, and the panel follows. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.click(canvas.getByRole('tab', { name: 'Tasks' }))
    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('tab', { name: 'People' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Priya Nair')
  },
}

/** Long lists scroll sideways on phones instead of wrapping. */
export const Overflow: Story = {
  args: { defaultValue: 'a' },
  render: (args) => (
    <Stack gap={3}>
      <div style={{ maxInlineSize: '20rem' }}>
        <Tabs {...args}>
          <Tabs.List aria-label="Workspaces">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((g) => (
              <Tabs.Trigger key={g} value={g.toLowerCase()}>
                Workspace {g}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((g) => (
            <Tabs.Content key={g} value={g.toLowerCase()}>
              Workspace {g} projects and members.
            </Tabs.Content>
          ))}
        </Tabs>
      </div>
    </Stack>
  ),
}

export const Disabled: Story = {
  args: { defaultValue: 'overview' },
  render: (args) => (
    <Tabs {...args}>
      <Tabs.List aria-label="Project">
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="files">Files</Tabs.Trigger>
        <Tabs.Trigger value="billing" disabled>
          Billing
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview">
        Brief, timeline and owners for the Atlas redesign.
      </Tabs.Content>
      <Tabs.Content value="files">Twelve files, last updated by Hana Kobayashi.</Tabs.Content>
    </Tabs>
  ),
}

export const Vertical: Story = {
  args: { defaultValue: 'profile', orientation: 'vertical' },
  render: (args) => (
    <Tabs {...args}>
      <Tabs.List aria-label="Settings">
        <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
        <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
        <Tabs.Trigger value="export">Export</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="profile">Ada Okafor · Lisbon</Tabs.Content>
      <Tabs.Content value="notifications">
        Email for mentions, a daily digest for the rest
      </Tabs.Content>
      <Tabs.Content value="export">Export CSV for 2025–26</Tabs.Content>
    </Tabs>
  ),
}

/**
 * Use tabs for peers the reader moves between: timetables by day, settings by area. Don't use them
 * for steps in order (that's a [Stepper](/docs/ui/navigation/stepper)) or for switching how the
 * same data is drawn (that's a [SegmentedControl](/docs/ui/actions/segmented-control)). Name the
 * list with `aria-label`.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Tabs defaultValue="weekdays">
        <Tabs.List aria-label="Coastal line timetable">
          <Tabs.Trigger value="weekdays">Weekdays</Tabs.Trigger>
          <Tabs.Trigger value="saturday">Saturday</Tabs.Trigger>
          <Tabs.Trigger value="sunday">Sunday and holidays</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="weekdays">
          <Text>Every 20 minutes from 06:10 to 23:50.</Text>
        </Tabs.Content>
        <Tabs.Content value="saturday">
          <Text>Every 30 minutes from 07:00 to 23:30.</Text>
        </Tabs.Content>
        <Tabs.Content value="sunday">
          <Text>Hourly from 08:00 to 22:00.</Text>
        </Tabs.Content>
      </Tabs>
    )
  },
  play: async ({ canvasElement }) => {
    // Navigation text stays off the caption steps (DESIGN.md §2 Type).
    const tab = within(storyRoot(canvasElement)).getByRole('tab', { name: 'Saturday' })
    await expect(fontSize(tab)).toBeGreaterThanOrEqual(resolvedSize(tab, 'var(--text-sm)'))
    await expect(fontSize(tab)).toBeGreaterThan(resolvedSize(tab, 'var(--text-xs)'))
  },
}

/**
 * `variant="underline"` (the default) sits on a hairline and marks the current tab with an accent
 * bar, for page-level sections. `variant="pill"` is compact, for switching views inside a card or
 * panel.
 */
export const Pill: Story = {
  name: 'Pill tabs',
  tags: ['docs'],
  render: function Pill() {
    return (
      <Tabs defaultValue="map" variant="pill">
        <Tabs.List aria-label="Route view">
          <Tabs.Trigger value="map">Map</Tabs.Trigger>
          <Tabs.Trigger value="stops">Stops</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="map">
          <Text tone="muted">The route on a map of the bay.</Text>
        </Tabs.Content>
        <Tabs.Content value="stops">
          <Text tone="muted">Fourteen stops, from Harbour Square to Marram Point.</Text>
        </Tabs.Content>
      </Tabs>
    )
  },
}
