import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'
import { Stack } from '#components/layout/Stack'
import { Tabs } from './Tabs'

const meta = {
  title: 'UI/Navigation/Tabs',
  component: Tabs,
  args: { defaultValue: 'matches', variant: 'underline' },
  render: (args) => (
    <Tabs {...args}>
      <Tabs.List aria-label="Harbour Hawks">
        <Tabs.Trigger value="matches">Matches</Tabs.Trigger>
        <Tabs.Trigger value="players">Players</Tabs.Trigger>
        <Tabs.Trigger value="history">History</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="matches">
        Harbour Hawks 3 – 0 Millpond FC · Round 1 · Harbour Park
      </Tabs.Content>
      <Tabs.Content value="players">Sione Taufa — 2 goals, 1 assist</Tabs.Content>
      <Tabs.Content value="history">Division two champions in 2019, 2022 and 2024.</Tabs.Content>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

/** Arrow keys move between tabs, and the panel follows. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.click(canvas.getByRole('tab', { name: 'Matches' }))
    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('tab', { name: 'Players' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Sione Taufa')
  },
}

/** Compact pills for a view switch inside a panel — a spending breakdown. */
export const Pill: Story = {
  args: { variant: 'pill', defaultValue: 'categories' },
  render: (args) => (
    <Tabs {...args}>
      <Tabs.List aria-label="Spending breakdown">
        <Tabs.Trigger value="categories">Categories</Tabs.Trigger>
        <Tabs.Trigger value="merchants">Merchants</Tabs.Trigger>
        <Tabs.Trigger value="recurring">Recurring</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="categories">
        Groceries $812.40 · Utilities $356.15 · Transport $214.90
      </Tabs.Content>
      <Tabs.Content value="merchants">Corner Grocer $498.20 · City Power $231.00</Tabs.Content>
      <Tabs.Content value="recurring">Streambox $22.99 · Tunehouse $13.99</Tabs.Content>
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
          <Tabs.List aria-label="Divisions">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((g) => (
              <Tabs.Trigger key={g} value={g.toLowerCase()}>
                Division {g}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((g) => (
            <Tabs.Content key={g} value={g.toLowerCase()}>
              Division {g} fixtures and table.
            </Tabs.Content>
          ))}
        </Tabs>
      </div>
    </Stack>
  ),
}

export const Disabled: Story = {
  args: { defaultValue: 'work' },
  render: (args) => (
    <Tabs {...args}>
      <Tabs.List aria-label="Studio">
        <Tabs.Trigger value="work">Work</Tabs.Trigger>
        <Tabs.Trigger value="writing">Writing</Tabs.Trigger>
        <Tabs.Trigger value="talks" disabled>
          Talks
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="work">Harbour transit map, library signage, a field guide.</Tabs.Content>
      <Tabs.Content value="writing">
        Notes on setting signs people can read at a glance.
      </Tabs.Content>
    </Tabs>
  ),
}

export const Vertical: Story = {
  args: { defaultValue: 'profile', orientation: 'vertical' },
  render: (args) => (
    <Tabs {...args}>
      <Tabs.List aria-label="Settings">
        <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
        <Tabs.Trigger value="accounts">Accounts</Tabs.Trigger>
        <Tabs.Trigger value="export">Export</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="profile">Ada Okafor · Lisbon</Tabs.Content>
      <Tabs.Content value="accounts">Everyday, Savings, Offset</Tabs.Content>
      <Tabs.Content value="export">Export CSV for 2025–26</Tabs.Content>
    </Tabs>
  ),
}
