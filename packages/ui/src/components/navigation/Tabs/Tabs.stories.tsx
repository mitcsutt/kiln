import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'
import { Stack } from '#components/layout/Stack'
import { Tabs } from './Tabs'

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

/** Compact pills for a view switch inside a panel — a storage breakdown. */
export const Pill: Story = {
  args: { variant: 'pill', defaultValue: 'projects' },
  render: (args) => (
    <Tabs {...args}>
      <Tabs.List aria-label="Storage breakdown">
        <Tabs.Trigger value="projects">Projects</Tabs.Trigger>
        <Tabs.Trigger value="members">Members</Tabs.Trigger>
        <Tabs.Trigger value="file-types">File types</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="projects">
        Atlas redesign 52 GB · Billing migration 21 GB · Help centre 8 GB
      </Tabs.Content>
      <Tabs.Content value="members">Priya Nair 18 GB · Tomás Ortega 11 GB</Tabs.Content>
      <Tabs.Content value="file-types">Images 44 GB · Video 29 GB · Documents 8 GB</Tabs.Content>
    </Tabs>
  ),
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
